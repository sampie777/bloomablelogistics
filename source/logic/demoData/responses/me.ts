import { MeResponse } from "../../bloomable/serverModels";

export const demoResponseMe = {
  "data": {
    "id": 1,
    "name": "Demo user",
    "email": "demo@gmail.com",
    "partner": {
      "id": 1,
      "name": "Demo Florist",
      "radius": 50,
      "address1": "123 Demoroad Demourb Demotown",
      "address2": null,
      "address3": null,
      "suburb": { "id": 44, "name": "Demourb", "city": { "id": 46, "name": "Demotown (Demoprovince)" } },
      "city": { "id": 46, "name": "Demotown (Demoprovince)" },
      "province": { "id": 77, "name": "Demotown (Demoprovince) and surrounds" },
      "country": "Earth",
      "postalCode": "1010",
      "latitude": -25.0008625,
      "longitude": 28.0000052,
      "enabled": true,
      "vatNumber": "1234567898",
      "partnerType": "Florist",
      "ownerName": "Demo user",
      "ownerEmail": "demo@gmail.com",
      "ownerPhone": "123 545 6555",
      "businessEmail": "demo@gmail.com",
      "businessPhone": "0155106898",
      "rating": 5,
      "bankName": null,
      "branchCode": null,
      "accountName": null,
      "accountNumber": null,
      "accountType": null,
      "avbobSalesChannel": true,
      "b2bSalesChannel": false,
      "inStoreSalesChannel": true,
      "webSalesSalesChannel": true,
    },
    "phoneNumber": "0155106898",
    "role": { "id": 1, "name": "Partner", "slug": "partner" },
    "isAdmin": false,
    "enabled": true,
    "isDeveloper": false,
  },
} as MeResponse;
