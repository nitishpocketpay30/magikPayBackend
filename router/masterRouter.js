
const express = require('express');
const masterController = require('../controller/masterController/userMasterController');
const master = express.Router();
master.get("/get-gender-list",masterController?.getGenderList);
master.get('/hobbies', masterController.getHobbiesList);
master.get('/interests', masterController.getInterestsList);
master.get('/religion', masterController.getReligionList);
master.get('/music-taste', masterController.getMusicTasteList);
master.get('/languages', masterController.getLanguagesList);
master.get('/countries', masterController.getCountryList);
master.get('/states', masterController.getStateList);
master.get('/cities', masterController.getCityList);

module.exports = master;