import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DataTableDirective } from 'angular-datatables';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

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
  files: any[] = [];
  selected: any = {};
  slideConfig = { slidesToShow: 1, slidesToScroll: 1 };
  slideConfigImg = { slidesToShow: 6, slidesToScroll: 6 };
  downloadURL!: Observable<string>;
  image: any[] = [];
  image1: any[] = [];
  image2: any[] = [];
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
    this.image = [];
    this.image = image;
    document.getElementById('imageModel')?.classList.add('block');
  }

  onAddProduct() {
    this.userForm.reset();
    this.submitted = false;
    document.getElementById('addModel')?.classList.add('block');
    this.db
      .collection('images')
      .ref.get()
      .then((res) => {
        res.forEach((doc: any) => {
          this.image1 = [...this.image1, ...doc.data().image];
        });
      });
  }

  onAddImage() {
    document.getElementById('addImage')?.classList.add('block');
  }

  onEditProduct(data: any) {
    this.userForm.reset();
    this.submitted = false;
    this.editData = data;
    document.getElementById('editModel')?.classList.add('block');
  }

  onFileSelected(event: any[]) {
    this.isLoading = true;

    return new Promise((resolve, reject) => {
      this.image = [];
      for (let i = 0; i < event.length; i++) {
        var n = Math.floor(
          Math.pow(10, 10 - 1) +
            Math.random() * (Math.pow(10, 10) - Math.pow(10, 10 - 1) - 1)
        );
        const file = event[i];
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
                  this.image.push(url);
                  if (i == event.length - 1) {
                    this.isLoading = false;
                    resolve('');
                  }
                }
              });
            })
          )
          .subscribe((url) => {});
      }
    });
  }

  onImageSelect(event: any) {
    this.fb = [];
    this.files = [];
    if (event.target.files && event.target.files[0]) {
      for (let index = 0; index < event.target.files.length; index++) {
        var reader = new FileReader();

        reader.onload = (event: ProgressEvent) => {
          this.fb.push((<FileReader>event.target).result);
        };

        this.files.push(event.target.files[index]);
        reader.readAsDataURL(event.target.files[index]);
      }
    }
    document.getElementById('file')!.nodeValue = '';
  }

  onSubmit() {
    this.submitted = true;
    document.getElementById('addModel')?.classList.add('block');

    if (this.userForm.invalid) {
      return;
    } else {
      console.log(this.image2);
      this.userForm.value.imagesPath = this.image2;
      this.db
        .collection('products')
        .ref.add(this.userForm.value)
        .then((res) => {
          this.toastr.success('Added');
          document.getElementById('addModel')?.classList.remove('block');
        })
        .catch((err) => {
          this.toastr.error(err.message);
        })
        .finally(() => {
          this.ReloadDatatable();
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

  onImageUpload() {
    this.onFileSelected(this.files)
      .then((data) => {
        this.db.collection('images').add({ image: this.image });
        document.getElementById('addImage')?.classList.remove('block');
        this.fb = [];
      })
      .catch((err) => {
        this.toastr.error('Something went wrong');
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

  onImageClose(i: any) {
    this.fb.splice(i, 1);
    this.files.splice(i, 1);
  }

  onImgSelect(val: any) {
    this.image2.indexOf(val) >= 0
      ? (this.image2 = this.image2.filter((el) => el !== val))
      : this.image2.push(val);
  }

  onClose() {
    document.getElementById('imageModel')?.classList.remove('block');
    document.getElementById('addModel')?.classList.remove('block');
    document.getElementById('editModel')?.classList.remove('block');
    document.getElementById('addImage')?.classList.remove('block');
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
}
