import {Component, OnInit} from '@angular/core';
import {RispoService} from '../../service/rispo.service';
import {Group, LoadGroupDataStatus} from '../../model/group';
import {ReportStatus} from '../../model/report-status';
import {Constants} from '../../utilities/Constants';
import {GroupedSelectBoxData} from '../../model/grouped-select-box-data';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractComponent} from '../../shared-module/component/abstarctComponent/abstract-component';
import {Logger, LoggerFactory} from '../../core-module/service/logging/LoggerFactory';
import {MessageBusService} from '../../core-module/service/messaging/message-bus.service';
import {ReceiverID} from '../../utilities/ReceiverID';

@Component({
  selector: 'app-available-dates',
  templateUrl: 'available-dates.component.html',
  styleUrls: ['available-dates.component.scss']
})
export class AvailableDatesComponent extends AbstractComponent implements OnInit {

  logger: Logger = LoggerFactory.getLogger('AvailableDatesComponent');

  selectedDateControl: FormControl = new FormControl();
  private group: Group;

  isVisible = false;

  reportDateList: Array<GroupedSelectBoxData> = new Array<GroupedSelectBoxData>();
  groupList: Array<Group> = new Array<any>();
  selectItemMap: Map<string, { 'groupID': number, 'creationDate': string }[]>;


  constructor(public rispoService: RispoService,
              private route: ActivatedRoute,
              private router: Router,
              private messageBusService: MessageBusService) {
    super(messageBusService);
  }


  ngOnInit(): void {

    const sub0 = this.rispoService.getReportsDetailsGroupBS().subscribe(value => {
      this.group = value;
      this.reportDateList = new Array<GroupedSelectBoxData>();
      this.isVisible = false;
      if (this.group.id !== undefined && this.group.id !== null) {


        if (this.group !== null && (this.group.status === ReportStatus.IN_PROGRESS || this.group.status.toString() === 'IN_PROGRESS')) {

          this.isVisible = true;
          this.loadReportDates();
          this.selectedDateControl.setValue(this.group.id);


        }
      }
    });

    this.subscriptions.push(sub0);


  }


  private loadReportDates(): void {

    try {

      this.selectItemMap = new Map<string, any[]>();

      this.reportDateList = new Array<GroupedSelectBoxData>();

      this.fetchGroupList().then(value => {

        this.groupList = value;
        this.seperateGroupListByReportDate(this.selectItemMap);
        this.reportDateList = this.createSelectItemList(this.selectItemMap);


      }, reason => {
        throw new Error(reason);
      });


    } catch (e) {
      this.log('Greska kod ucitavanja svih grupa ' + e);
      this.addMessage(Constants.GROUP_FETCH.toString(), Constants.GROUP_ALL_FETCH_ERROR.toString());
      this.redirectGeneric(); // NT
    }


  }

  private redirectGeneric(): void {

    this.router.navigate(['../genericError'], {relativeTo: this.route});


  }

  private createSelectItemList(selectItemMap: Map<string, any[]>): Array<any> {

    const selectItemList: Array<GroupedSelectBoxData> = new Array<GroupedSelectBoxData>();
    let groupedSelectBoxData: GroupedSelectBoxData;

    selectItemMap.forEach((value, key) => {

      groupedSelectBoxData = new GroupedSelectBoxData();
      groupedSelectBoxData.reportDate = key;
      groupedSelectBoxData.creationDatesArray = value;

      selectItemList.push(groupedSelectBoxData);

    });

    return selectItemList;

  }


  private seperateGroupListByReportDate(selectItemMap: Map<string, any[]>): void {

    try {

      this.groupList.forEach(g => {

        const reportDate: string = g.reportDateAsString;

        if (!(Array.from(selectItemMap.keys())).some(x => x === reportDate)) {
          selectItemMap.set(reportDate, new Array<any>());
        }

        selectItemMap.get(reportDate).push({'groupID': g.id, 'creationDate': g.creationDateAsString});

      });


    } catch (e) {

      this.log('ERROR seperateGroupListByReportDate: ' + e);


    }

  }

  private fetchGroupList(): Promise<Array<Group>> {


    try {

      if (this.group.kpo === undefined || this.group.kpo === null || this.group.kpo === '') {

        return this.rispoService.findAll(2, this.group.mb).toPromise();

      } else {

        return this.rispoService.findAll(1, this.group.kpo).toPromise();

      }


    } catch (e) {
      this.log('ERROR fetchGroupList: ' + e);
      return Promise.reject(e);


    }

  }


  onReportDateChange(): void {

    const groupOnDateID: number = this.selectedDateControl.value;

    // this.rispoService.loadGroupData.next();

    this.sendMessage(ReceiverID.RECEIVER_ID_LOAD_GROUP_DATA,
      {'id': groupOnDateID.toString(10), 'status': LoadGroupDataStatus.LOAD_NEW_GROUP_DATA}
    );


  }


}


