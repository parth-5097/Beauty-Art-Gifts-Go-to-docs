import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

declare var require: any;
const FileSaver = require('file-saver');

@Component({
  selector: 'app-view-order-pdf',
  templateUrl: './view-order-pdf.component.html',
  styleUrls: ['./view-order-pdf.component.css'],
})
export class ViewOrderPdfComponent implements OnInit {
  files: any[] = [];
  customer: any = {};

  constructor(
    private route: ActivatedRoute,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    private db: AngularFirestore
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((res) => {
      this.customer.id = res.id;
      this.db
        .collection('customers')
        .doc(this.customer.id)
        .ref.get()
        .then((user) => {
          this.customer = { ...this.customer, data: user.data() };
        });
      this.storage
        .ref('ordersPdf/' + res.id)
        .listAll()
        .subscribe((res) => {
          res.items.length > 0
            ? res.items.forEach((file) => {
                this.storage
                  .ref(file.fullPath)
                  .getDownloadURL()
                  .subscribe((url) => {
                    this.files.push({ name: file.name, url });
                  });
              })
            : ``;
        });
    });
  }

  onDeletePdf(name: any) {
    if (name) {
      this.storage
        .ref('ordersPdf/' + this.customer.id + '/' + name)
        .delete()
        .subscribe((res) => {
          this.toastr.success(`Deleted SuccessFully`);
          this.files = this.files.filter((el) => el.name != name);
        });
    } else {
      this.toastr.error(`Missing parameters for file`);
    }
  }

  downloadPdf(pdfUrl: string, pdfName: string) {
    FileSaver.saveAs(pdfUrl, pdfName);
  }
}
