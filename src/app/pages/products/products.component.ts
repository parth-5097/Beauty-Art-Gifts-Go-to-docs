import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit, OnDestroy {
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  @ViewChild(DataTableDirective, { static: false })
  datatableElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  data: any[] = [];
  selectedFile: any = null;
  fb: any[] = [];
  slideConfig = { slidesToShow: 1, slidesToScroll: 1 };
  downloadURL!: Observable<string>;
  image: any[] = [];
  editData: any;
  userForm!: FormGroup;
  submitted = false;
  isLoading: any = false;

  constructor(
    private db: AngularFirestore,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      pageLength: 20,
      destroy: true,
      scrollY: '50vh',
      responsive: true,
    };
    this.userForm = this.formBuilder.group({
      amount: ['', Validators.required],
      category: ['', Validators.required],
      color: ['', Validators.required],
      description: ['', Validators.required],
      title: ['', Validators.required],
    });
    this.getdbData().then((data) => {
      this.dtTrigger.next();
    });
  }

  getdbData() {
    this.data = [];
    return new Promise((resolve, reject) => {
      this.db
        .collection('products')
        .ref.get()
        .then((res) => {
          res.forEach((doc: any) => {
            this.data.push({ id: doc.id, ...doc.data() });
          });
        })
        .finally(() => {
          resolve('');
        });
    });
  }

  get f() {
    return this.userForm.controls;
  }

  ReloadDatatable() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.getdbData().then((data) => {
        this.dtTrigger.next();
      });
    });
  }

  rerender(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtTrigger.next();
    });
  }

  onImage(image: any) {
    console.log(image);
    this.image = [];
    this.image = image;
    document.getElementById('imageModel')?.classList.add('block');
  }

  onAddProduct() {
    this.userForm.reset();
    this.submitted = false;
    document.getElementById('addModel')?.classList.add('block');
  }

  onEditProduct(data: any) {
    this.userForm.reset();
    this.submitted = false;
    this.editData = data;
    document.getElementById('editModel')?.classList.add('block');
  }

  onFileSelected(event: any) {
    this.isLoading = true;

    for (let i = 0; i < event.target.files.length; i++) {
      var n = Math.floor(
        Math.pow(10, 10 - 1) +
          Math.random() * (Math.pow(10, 10) - Math.pow(10, 10 - 1) - 1)
      );
      const file = event.target.files[i];
      const filePath = `AdminImages/${n}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(`AdminImages/${n}`, file);
      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            this.downloadURL = fileRef.getDownloadURL();
            this.downloadURL.subscribe((url) => {
              if (url) {
                this.fb.push(url);
                if (i == event.target.files.length - 1) {
                  this.isLoading = false;
                }
              }
            });
          })
        )
        .subscribe((url) => {});
    }
    document.getElementById('addModel')?.classList.add('block');
  }

  onSubmit() {
    this.submitted = true;
    document.getElementById('addModel')?.classList.add('block');

    if (this.userForm.invalid) {
      return;
    } else {
      this.userForm.value.imagesPath = this.fb;
      this.db
        .collection('products')
        .ref.add(this.userForm.value)
        .then((res) => {
          this.toastr.success('Added');
          document.getElementById('addModel')?.classList.remove('block');
          setTimeout(() => {
            this.ReloadDatatable();
          }, 0);
        })
        .catch((err) => {
          this.toastr.error(err.message);
        });
    }
  }

  onDelete(id: any) {
    this.db
      .collection('products')
      .doc(id)
      .ref.delete()
      .then((res) => {
        this.ReloadDatatable();
        this.toastr.success('Deleted');
      })
      .catch((err) => {
        this.toastr.error(err.message);
      });
  }

  onEditSubmit() {
    document.getElementById('editModel')?.classList.add('block');
    Object.keys(this.userForm.value).forEach((e) => {
      this.userForm.value[e]
        ? this.userForm.value[e]
        : delete this.userForm.value[e];
    });

    this.db
      .collection('products')
      .doc(this.editData.id)
      .ref.update(this.userForm.value)
      .then((res) => {
        this.toastr.success('Updated');
        document.getElementById('editModel')?.classList.remove('block');
        this.ReloadDatatable();
      })
      .catch((err) => {
        this.toastr.error(err.message);
      });
  }

  onClose() {
    document.getElementById('imageModel')?.classList.remove('block');
    document.getElementById('addModel')?.classList.remove('block');
    document.getElementById('editModel')?.classList.remove('block');
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
}