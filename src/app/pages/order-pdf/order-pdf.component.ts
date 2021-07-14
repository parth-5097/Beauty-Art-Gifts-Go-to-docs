import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { DataTableDirective } from 'angular-datatables';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

declare var require: any;
const FileSaver = require('file-saver');

@Component({
  selector: 'app-order-pdf',
  templateUrl: './order-pdf.component.html',
  styleUrls: ['./order-pdf.component.css'],
})
export class OrderPdfComponent implements OnInit {
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  @ViewChild(DataTableDirective, { static: false })
  datatableElement!: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  data: any[] = [];
  files: any[] = [];
  slideConfig = { slidesToShow: 8, slidesToScroll: 4 };

  constructor(
    private db: AngularFirestore,
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

    this.getdbData();
  }

  getdbData() {
    this.data = [];
    return new Promise((resolve, reject) => {
      this.db
        .collection('customers')
        .ref.get()
        .then((res) => {
          res.forEach((doc: any) => {
            let user = { id: doc.id, ...doc.data() };
            this.storage
              .ref('ordersPdf/' + doc.id)
              .listAll()
              .subscribe((res) => {
                res.items.length > 0
                  ? res.items.forEach((file) => {
                      this.storage
                        .ref(file.fullPath)
                        .getDownloadURL()
                        .subscribe((res) => {
                          user.orderFiles = user.orderFiles
                            ? [
                                ...user.orderFiles,
                                { id: user.id, name: file.name, url: res },
                              ]
                            : [{ id: user.id, name: file.name, url: res }];
                          this.data.find((el) => el.id == user.id)
                            ? ``
                            : this.data.push(user);
                        });
                    })
                  : ``;
              });
          });
        })
        .catch((err) => {
          return reject(err);
        })
        .finally(() => resolve(``));
    });
  }

  ReloadDatatable() {
    this.getdbData().then((data) => {
      this.dtTrigger.next();
    });
  }

  rerender(): void {
    this.dtTrigger.next();
  }

  onViewPdf(id: any) {
    this.files = this.data.find((el) => el.id == id).orderFiles;
    document.getElementById('imageModel')?.classList.add('block');
  }

  onClose() {
    document.getElementById('imageModel')?.classList.remove('block');
  }

  onDeletePdf(id: any, name: any) {
    if (id && name) {
      this.storage
        .ref('ordersPdf/' + id + '/' + name)
        .delete()
        .subscribe((res) => {
          this.toastr.success(`Deleted SuccessFully`);
          this.files = this.files.filter((el) => {
            if ((el.id == id && el.name != name) || el.id != id) {
              return el;
            }
          });
        });
    } else {
      this.toastr.error(`Missing parameters for file`);
    }
  }

  downloadPdf(pdfUrl: string, pdfName: string) {
    FileSaver.saveAs(pdfUrl, pdfName);
  }
}
