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
			event.preventDefault();
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
			populateDataFramework(profile.data);
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

function populateDataFramework(dataFramework) {
	var dataPane = document.querySelector('#data-pane');
	while (dataPane.hasChildNodes()) {
		dataPane.removeChild(dataPane.lastChild);
	}
	/*
	var tableOfContents = document.createElement('div');
		tableOfContents.classList.add('card');
		var tocHeader = document.createElement('div');
			tocHeader.classList.add('card-header');
			var tocHeaderH5 = document.createElement('h5')
				tocHeaderH5.classList.add('mb-0');
				var tocHeaderLink = document.createElement('a');
					tocHeaderLink.href = '#tocContent';
					tocHeaderLink.dataset.toggle = 'collapse';
					var tableOfContentsText = document.createTextNode("Table of Contents");
					tocHeaderLink.appendChild(tableOfContentsText);
				tocHeaderH5.appendChild(tocHeaderLink);
			tocHeader.appendChild(tocHeaderH5);
		tableOfContents.appendChild(tocHeader);
	dataPane.appendChild(tableOfContents);
	*/	
	dataFramework.forEach(function(section, si) {
		console.log(section);
		//console.log(Object.keys(dataFramework[si])[0]);
		//var sectionHeadingString = Object.keys(dataFramework[si])[0];
		var sectionHeading = document.createElement('h3');
			sectionHeading.id = 'data-heading-' + si;
				var sectionHeadingText = document.createTextNode(Object.keys(section)[0]);
			sectionHeading.appendChild(sectionHeadingText);
		dataPane.appendChild(sectionHeading);
		section[Object.keys(section)[0]].forEach(function(dataTable, six) {
			var dataTypes = [];
			console.log(dataTable);
			var tableName = Object.keys(dataTable)[0];
			var table = document.createElement("table");
				table.id = tableName + "-table";
				table.classList.add('table');
				table.classList.add('table-striped');
				var thead = document.createElement("thead");
					var tr = document.createElement("tr");
						console.log(dataTable[tableName]["variables"]);
						var titleTh = document.createElement("th");
							var titleThText = document.createTextNode(tableName);
							titleTh.appendChild(titleThText);
						tr.appendChild(titleTh);
						var headerControls = document.createElement("th");
							var helpIcon = document.createElement('i');
								helpIcon.classList.add('material-icons');
								helpIcon.classList.add('ask-help');
								//helpIcon.classList.add('float-right');
								var helpIconText = document.createTextNode('help');
								helpIcon.appendChild(helpIconText);
								helpIcon.addEventListener('click', function(event) {
									var thead = event.target.parentNode.parentNode.parentNode;
									var helpbox = thead.querySelector('tr:nth-child(2) > th > .helpbox');
									if (helpbox.classList.contains('collapsed')) {
										helpbox.classList.remove('collapsed');
									} else {
										helpbox.classList.add('collapsed');
									}
								});
							headerControls.appendChild(helpIcon);
						tr.appendChild(headerControls);
						dataTable[tableName]["variables"].forEach(function(variable) {
							dataTypes.push(variable.type);
							var th = document.createElement("th");
								thText = document.createTextNode(variable.name);
							th.appendChild(thText);
							tr.appendChild(th);
						});
					thead.appendChild(tr);
					var helpTr = document.createElement("tr");
						var helpTh = document.createElement("th");
							helpTh.colSpan = dataTable[tableName]["variables"].length + 2;
							var helpDiv = document.createElement("div");
								helpDiv.classList.add('alert');
								helpDiv.classList.add('alert-info');
								helpDiv.classList.add('helpbox');
								helpDiv.classList.add('collapsed');
								helpDiv.innerHTML = dataTable[tableName]["description"];
							helpTh.appendChild(helpDiv);
						helpTr.appendChild(helpTh);
					thead.appendChild(helpTr);
				var tbody = document.createElement("tbody");
				dataTable[tableName]["dataset"].forEach(function(category, dsi) {
					var bodyTr = document.createElement('tr');
						var bodyTh = document.createElement('th');
							bodyTh.scope = "row";
							bodyTh.setAttribute("contentEditable", true);
							var bodyThText = document.createTextNode(category.name);
							bodyTh.appendChild(bodyThText);
						bodyTr.appendChild(bodyTh);
						var rowControls = document.createElement('th');
							var plusIcon = document.createElement('i');
								plusIcon.classList.add('material-icons');
								plusIcon.classList.add('add-row');
								var plusIconText = document.createTextNode('add_circle');
								plusIcon.appendChild(plusIconText);
								plusIcon.addEventListener('click', function(event) {
									console.log(event.target.parentNode.parentNode.parentNode);
									var referenceNode = event.target.parentNode.parentNode;
									var fieldsToAdd = event.target.parentNode.parentNode.parentNode.parentNode.querySelectorAll('thead > tr > th').length-3;
									var addedTr = document.createElement('tr');
										var addedTh = document.createElement('th');
											addedTh.scope = "row";
											addedTh.setAttribute("contentEditable", true);
									addedTr.appendChild(addedTh);
									var addedControls = document.createElement('th');
									addedTr.appendChild(addedControls);
									for (var i = 0, len = fieldsToAdd; i < len; i++) {
										var addedTd = document.createElement('td');
											addedTd.setAttribute("contentEditable", true);
										addedTr.appendChild(addedTd);
									}
									referenceNode.parentNode.insertBefore(addedTr, referenceNode.nextSibling);
								});
							rowControls.appendChild(plusIcon);
							var minusIcon = document.createElement('i');
								minusIcon.classList.add('material-icons');
								minusIcon.classList.add('remove-row');
								//minusIcon.classList.add('float-right');
								var minusIconText = document.createTextNode('remove_circle');
								minusIcon.appendChild(minusIconText);
								minusIcon.addEventListener('click', function(event) {
									var killRow = event.target.parentNode.parentNode;
									console.log(killRow);
									killRow.parentNode.removeChild(killRow);
								});
							rowControls.appendChild(minusIcon);
						bodyTr.appendChild(rowControls);
						var datapoints = category.datapoints;
						datapoints.forEach(function(datapoint, dix) {
							var innerTd = document.createElement('td');
							innerTd.setAttribute("contentEditable", true);
							if (dataTypes[dix] === 'address') {
								innerTd.classList.add('address');
								innerTd.addEventListener('blur', addressLookup);
							}
								var innerTdText = document.createTextNode(datapoint);
							innerTd.appendChild(innerTdText);
							bodyTr.appendChild(innerTd);
						});
					tbody.appendChild(bodyTr);
				});
			table.appendChild(thead);
			table.appendChild(tbody);
			dataPane.appendChild(table);
		});
	});
}

/*function populateDataFramework (data) {
	console.log(data);
	var dataPane = document.querySelector('#data-pane');
	while (dataPane.hasChildNodes()) {
		dataPane.removeChild(dataPane.lastChild);
	}
	data.forEach(function(section, si) {
		var sectionHeading = document.createElement('h3');
			sectionHeading.id = 'data-heading-' + si;
			var sectionHeadingText = document.createTextNode(Object.keys(section)[0]);
		sectionHeading.appendChild(sectionHeadingText);
		dataPane.appendChild(sectionHeading);
		section[Object.keys(section)[0]].forEach(function(newTableObject, six, section) {
			console.log(newTableObject);
			var tableName = Object.keys(newTableObject)[0];
			var table = document.createElement("table");
				table.id = tableName + "-table";
				table.classList.add('table');
				table.classList.add('table-striped');
			dataPane.appendChild(table);
		});
	});
}*/
