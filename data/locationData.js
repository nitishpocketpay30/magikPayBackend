module.exports = {
  countries: [
    { id: 1, name: "India" },
    { id: 2, name: "USA" },
    { id: 3, name: "Canada" },
    { id: 4, name: "Germany" },
    { id: 5, name: "Australia" },
  ],

  states: [
    { id: 1, name: "Maharashtra", countryId: 1 },
    { id: 2, name: "California", countryId: 2 },
    { id: 3, name: "Ontario", countryId: 3 },
    { id: 4, name: "Bavaria", countryId: 4 },
    { id: 5, name: "New South Wales", countryId: 5 }
  ],

  cities: [
    { id: 1, name: "Mumbai", stateId: 1 },
    { id: 2, name: "Los Angeles", stateId: 2 },
    { id: 3, name: "Toronto", stateId: 3 },
    { id: 4, name: "Munich", stateId: 4 },
    { id: 5, name: "Sydney", stateId: 5 }
  ]
};
