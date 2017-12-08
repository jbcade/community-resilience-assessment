document.addEventListener("DOMContentLoaded", function() {
	const backend = 'https://us-central1-exemplary-rex-97621.cloudfunctions.net/Community-Resilience-Assessment/';
	var stateSelect = document.getElementById('state');
	var stateOption = stateSelect.querySelector(':checked');
	var state = {
		name: stateSelect.value,
		abbreviation: stateOption.dataset.stateabbr,
		code: stateOption.dataset.statefp
	};
	stateSelect.addEventListener('change', function(event) {
		state.name = event.target.value;
		var selectedState = event.target.querySelector(':checked');
		state.abbreviation = selectedState.dataset.stateabbr;
		state.code = selectedState.dataset.statefp;
		console.log(state.name + " " + state.abbreviation + " " + state.code);
		
		//var countyList = document.querySelectorAll("#county > option");
		var visibleCounties = document.querySelectorAll("#county > option:not(.no-display)");
		for (var i = 0, len = visibleCounties.length; i < len; i++) {
			visibleCounties[i].classList.add('no-display');
		}
		var statewideCounties = document.querySelectorAll('#county > option[data-statefp="' + state.code + '"]');
		for (var i = statewideCounties.length - 1; i >= 0; --i) {
			var parentSelect = statewideCounties[i].parentNode;
			statewideCounties[i].classList.remove('no-display');
			if (i === 0) {
				statewideCounties[i].selected = true;	
				var event = new Event('change');
				document.getElementById('county').dispatchEvent(event);
			}
			statewideCounties[i].remove();
			parentSelect.prepend(statewideCounties[i]);
		}
	});

	var countySelect = document.getElementById('county');
	var countyOption = countySelect.querySelector(':checked');
	var county = {
		name: countySelect.value,
		type: countyOption.dataset.type,
		code: stateOption.dataset.placefp
	};
	countySelect.addEventListener('change', function(event) {
		county.name = event.target.value;
		var selectedCounty = event.target.querySelector(':checked');
		county.type = selectedCounty.dataset.type;
		county.code = selectedCounty.dataset.placefp;
		var placesURL = encodeURI(backend + 'places?state=' + state.abbreviation + '&county=' + county.name);
		console.log(county.name + " " + county.type + " " + county.code);
		
		fetch(placesURL).then(function(response) {
			if(response.ok) {
				return response.json();
			}
			throw new Error('Network response was not ok.');
		}).then(function(countyPlaces) { 
			console.log(countyPlaces);
			var placeSelect = document.getElementById('place');
			while (placeSelect.hasChildNodes()) {
				placeSelect.removeChild(placeSelect.lastChild);
			}
			var defaultPlaceOption = document.createElement('option');
				defaultPlaceOption.selected = true;
				defaultPlaceOption.dataset.placefp = "";
				defaultPlaceOption.dataset.type = "";
				var defaultPlaceOptionText = document.createTextNode("None");
					defaultPlaceOption.appendChild(defaultPlaceOptionText);
				placeSelect.appendChild(defaultPlaceOption);
			countyPlaces.forEach((place) => {
				var placeOption = document.createElement('option');
					placeOption.dataset.placefp = place.code;
					placeOption.dataset.type = place.type;
					var placeOptionText = document.createTextNode(place.name);
					placeOption.appendChild(placeOptionText);
				placeSelect.appendChild(placeOption);
			});
		}).catch(function(error) {
			console.log('There has been a problem with your fetch operation: ' + error.message);
		});
	});
	
	var questionNumber = 1;
	var surveyNumber = 2;
	var newSurveyButton = document.getElementById('new-survey');
	newSurveyButton.addEventListener('click', function(event) {
		event.preventDefault();
		var newSurveyButtonWrapper = document.getElementById('survey-list');
		newSurveyButtonWrapper.insertAdjacentHTML('beforeend', '<li class="nav-item"><a class="nav-link" data-toggle="pill" contenteditable href="#surveyTable-pane-' + surveyNumber + '">Participant ' + surveyNumber + '</a></li>');
		var newSurveyTable = document.createElement('table');
		newSurveyTable.id = 'surveyTable-' + surveyNumber;
		newSurveyTable.classList.add('table');
		newSurveyTable.classList.add('assessment-table');
			var newTbody = document.createElement('tbody');
			newSurveyTable.appendChild(newTbody);
		var surveyPaneContent = document.querySelector('#survey-pane > .tab-content');
		var pillPane = document.createElement('div');
			pillPane.id = 'surveyTable-pane-' + surveyNumber;
			pillPane.classList.add('tab-pane');
			pillPane.classList.add('fade');
			pillPane.appendChild(newSurveyTable);
		surveyPaneContent.appendChild(pillPane);
		buildAssessments(surveyNumber);
		surveyNumber++;
	});

	var overlays = [];
	var selectables = document.getElementsByClassName('dropdown-item');
	for (var i = 0, len = selectables.length; i < len; i++) {
        	selectables[i].addEventListener('click', function(event) {
			var overlayName = event.target.title;
			if(document.getElementById('option-' + overlayName).selected == false) {
				document.getElementById('option-' + overlayName).selected = true;
			} else if (document.getElementById('option-' + overlayName).selected == true) {
				document.getElementById('option-' + overlayName).selected = false;
			}
			overlayStringArray = [];
			selectedOverlays = document.querySelectorAll('#multiSelect > option:checked')
			if(selectedOverlays.length > 0) {
				for (var i = 0, len = selectedOverlays.length; i < len; i++) {
					overlayStringArray.push(selectedOverlays[i].textContent);
					overlays.push(selectedOverlays[i].value);
					overlayString = overlayStringArray.join(', ');
				}
			} else {
				overlayString = "None";
				overlays = [];
			}
			document.getElementById('selectedOverlayName').textContent = overlayString;
		});
	}

	var placeSelect = document.getElementById('place');
	var placeOption = placeSelect.querySelector(':checked');
	var place = {
		name: placeSelect.value,
		code: placeOption.dataset.placefp,
		type: stateOption.dataset.type
	};
	var generateButton = document.getElementById('generate');
	generate.addEventListener('click', function() {
		place.name = placeSelect.value;
		var currentPlace = placeSelect.querySelector(':checked');
		place.code = currentPlace.dataset.placefp;
		place.type = currentPlace.dataset.type;
		var assessURL = encodeURI(backend + 'assess?state-abbr=' + state.abbreviation + '&state-fips=' + state.code + '&state-name=' + state.name + '&county-fips=' + county.code + '&county-name=' + county.name + '&place-fips=' + place.code + '&place-type=' +  place.type + '&place-name=' + place.name + '&overlays=' + JSON.stringify(overlays));
		fetch(assessURL).then(function(response) {
			if(response.ok) {
				return response.json();
			}
			throw new Error('Network response was not ok.');
		}).then(function(profile) { 
			var populationString = profile.population.toLocaleString();
			document.getElementById('jurisdiction-name').textContent = profile.jurisdiction.place.name + ' Resilience Profile'
			document.getElementById('total-population').textContent = 'Population: ' + populationString;
			document.getElementById('tab-switcher').hidden = false;
			document.getElementById('report-header').hidden = false;
		}).catch(function(error) {
			console.log('There has been a problem with your fetch operation: ' + error.message);
		});		
	});
	
	var exportSurveyButton = document.getElementById('export-surveys');
	exportSurveyButton.addEventListener('click', function() {
		dataURL = "data:text/tab-separated-values," + document.getElementById("export-data-url").dataset.template;
		var assessments = document.getElementsByClassName('assessment-table');
		for (var i = 0, len = assessments.length; i < len; i++) {
			dataURL += document.querySelector('#survey-list > li:nth-child(' + (i+1) + ') > a').textContent;
			console.log(assessments[i]);
			var responseTd = assessments[i].getElementsByClassName('survey-input');
			for (var ii = 0, lenInner = responseTd.length; ii < lenInner; ii++) {
				var questionResponse = responseTd[ii].querySelector('input:checked');
				if(questionResponse === null) {
					dataURL += "\t";
				} else {
					dataURL += "\t" + questionResponse.value;
				}
			}
			console.log(responseTd);
			dataURL += "\n";
		}
		document.getElementById("export-data-url").href = encodeURI(dataURL);
	});
	

	/*
	var geocoder;
	var map;
	$('#activate-map-tab').on('shown.bs.tab', function (e) {
		google.maps.event.trigger(map, 'resize');
		console.log('Map resized');
		var address = document.getElementById('address').value;
		geocoder.geocode( { 'address': address}, function(results, status) {
		  if (status == 'OK') {
			//map.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
				map: map,
				icon: 'hospitals.png',
				position: results[0].geometry.location
			});
		  } else {
			alert('Geocode was not successful for the following reason: ' + status);
		  }
		});
	})*/
	
	var multiselects = document.getElementsByClassName('multiselect');
	for (var i = 0, len = multiselects.length; i < len; i++) {
		multiselects[i].addEventListener('click', function(event) {
			event.stopPropagation();
		});
	}
});
