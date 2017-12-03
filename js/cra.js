var population = 0;
var overlays = [];
//var jurisdictionString = "";
var questionNumber = 1;
var surveyNumber = 2;
var stateString = "maryland";
var geocoder;
var map;

document.addEventListener("DOMContentLoaded", function() {
	
	var stateSelect = document.getElementById('state');
	stateSelect.addEventListener('change', function(event) {
		console.log(event.target.value);
	});
	
	var multiselects = document.getElementsByClassName('multiselect');
	for (var i = 0, len = multiselects.length; i < len; i++) {
		multiselects[i].addEventListener('click', function(event) {
			event.stopPropagation();
		});
	}
	
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
	
	var generateButton = document.getElementById('generate');
	generate.addEventListener('click', function() {/*
		var selectedJurisdiction = document.getElementById('jurisdiction');
		profile.jurisdiction["name"] = document.querySelector('option[value="'+selectedJurisdiction.value+'"]').textContent;
		profile.jurisdiction["fips"] = selectedJurisdiction.value;
		console.log(profile.jurisdiction["fips"]);
		fetchCensusData('B01003_001E', function(populationResponse) {
			var populationString = JSON.parse(populationResponse).pop();
			population = parseInt(populationString.splice(0,1));
			profile.population = population;
			populationString = profile.population.toLocaleString();
			document.getElementById('jurisdiction-name').textContent = profile.jurisdiction["name"] + ' Resilience Profile'
			document.getElementById('total-population').textContent = 'Population: ' + populationString;
			document.getElementById('tab-switcher').hidden = false;
			document.getElementById('report-header').hidden = false;
			buildAssessments(1);
			populateDataFramework();
			$('[data-toggle="popover"]').popover({
				trigger: 'hover',
				container: 'body'
			})
		});*/
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
});
