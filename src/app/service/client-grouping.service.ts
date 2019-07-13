import {Injectable} from '@angular/core';
import {Client} from '../model/client';
import {Exposure} from '../model/exposure';


@Injectable()
export class ClientGroupingService {


  constructor() {


  }


  public group(clients: Array<Client>): Client {


    const selectedClients: Array<Client> = this.getSelectedClients(clients);

    if (selectedClients === null || selectedClients.length === 0) {
      throw new Error('Nema odabranih klijenata za grupiranje');
    }

    if (selectedClients.length === 1) {
      throw new Error('Odabran je samo jedan klijent');
    }

    const client: Client = this.initializeGroupedClient(selectedClients[0]);

    client.borrower = '';
    client.financialsEnclosed = null;

    let isSameIndustry = true;
    let isSameCountry = true;
    let isSameOwner = true;
    let isSameIntRating = true;
    let isSameRatingModel = true;
    let isSamePD = true;
    let isSameRatingRelation = true;

    selectedClients.forEach(c => {

      if (client.exposures === undefined || client.exposures === null) {
        client.exposures = new Array<Exposure>();
      }

      client.exposures.push(...c.exposures);
      client.total.add(c.total);

      if (isSameIndustry && client.industry !== c.industry) {
        isSameIndustry = false;
        client.industry = null;
      }

      if (isSameCountry && client.country !== c.country) {
        isSameCountry = false;
        client.country = null;
      }

      if (isSameOwner && client.ownerName !== c.ownerName) {
        isSameOwner = false;
        client.ownerName = null;
      }

      if (isSameIntRating && client.intRating !== c.intRating) {
        isSameIntRating = false;
        client.intRating = null;
      }

      if (isSameRatingModel && client.ratingModel !== c.ratingModel) {
        isSameRatingModel = false;
        client.ratingModel = null;
      }

      if (isSamePD && client.pd !== c.pd) {
        isSamePD = false;
        client.pd = null;
      }

      if (isSameRatingRelation && client.ratingRelation !== c.ratingRelation) {
        isSameRatingRelation = false;
        client.ratingRelation = null;
      }


    });


    return client;


  }


  private getSelectedClients(clients: Array<Client>): Array<Client> {

    const selectedClients: Array<Client> = new Array<Client>();

    if (clients) {
      clients.forEach(client => {

        if (client.selected) {
          selectedClients.push(client);
        }

      });

    }

    return selectedClients;


  }

  private initializeGroupedClient(client: Client): Client {

    const groupedClient: Client = new Client();
    groupedClient.groupId = client.groupId;
    groupedClient.industry = client.industry;
    groupedClient.country = client.country;
    groupedClient.ratingRelation = client.ratingRelation;
    groupedClient.ownerName = client.ownerName;
    groupedClient.intRating = client.intRating;
    groupedClient.ratingModel = client.ratingModel;
    groupedClient.pd = client.pd;
    groupedClient.grouped = true;

    return groupedClient;

  }

}
