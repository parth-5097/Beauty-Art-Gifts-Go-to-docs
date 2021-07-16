import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'simple_numbers',
      pageLength: 20,
      destroy: true,
      scrollY: '50vh',
      responsive: true,
    };

    this.getdbData().then((data) => {
      setTimeout(() => {
        this.dtTrigger.next();
      }, 1000);
    });
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
                  ? this.data.find((el) => el.id == user.id)
                    ? ``
                    : this.data.push({ ...user, totalPdf: res.items.length })
                  : ``;
              });
          });
          resolve(``);
        })
        .catch((err) => {
          return reject(err);
        });
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
    this.router.navigate([`order/${id}`]);
  }

  onClose() {
    document.getElementById('imageModel')?.classList.remove('block');
  }
}
