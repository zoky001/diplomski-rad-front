import { Client } from './client';
import { Exposure } from './exposure';
import { Group } from './group';
import { RispoService } from '../service/rispo.service';

export class GroupCommand {
  id: number;
  name: string;
  kpo: string;
  mb: string;
  jmbg: string;
  oib: string;
  application: string;
  status: string;
  progress: number;
  reportDate: number;
  owner: string;
  members: Client[];
  total: Exposure;
  creationDate: number;
  currency: string;
  djelomicanDohvat: boolean;
  dohvatPoPostojecimClanicama: boolean;
  orgJed: string;
  intRateHRK: number;
  intRateEUR: number;
  creationDateAsString: string;
  reportDateAsString: string;

  private feesHRK: number;
  private feesEUR: number;


  constructor(group: Group) {
    this.id = group.id;
    this.name = group.name;
    this.kpo = group.kpo;
    this.mb = group.mb;
    this.jmbg = group.jmbg;
    this.oib = group.oib;
    this.application = group.application;
    this.status = RispoService.reportStatusEnumToString(group.status);
    this.progress = group.progress;
    this.reportDate = group.reportDate.getTime();
    this.owner = group.owner;
    this.members = group.members;
    this.total = group.total;

    this.total.tenorDate = group.total.getTenorDate().getTime();
    this.total.lessThanYearAsString = group.total.getLessThanYearAsString();

    this.creationDate = group.creationDate.getTime();
    this.currency = group.currency;
    this.djelomicanDohvat = group.djelomicanDohvat;
    this.dohvatPoPostojecimClanicama = group.dohvatPoPostojecimClanicama;
    this.orgJed = group.orgJed;
    this.intRateHRK = group.intRateHRK;
    this.intRateEUR = group.intRateEUR;
    this.creationDateAsString = group.creationDateAsString;
    this.reportDateAsString = group.reportDateAsString;
    this.feesHRK = group.feesHRK;
    this.feesEUR = group.feesEUR;
  }

}
