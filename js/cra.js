var infrastructureMap;
var geocoder;
var jurisdictionBounds;

document.addEventListener("DOMContentLoaded", function() {
	geocoder = new google.maps.Geocoder();
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
	
	var surveyTracker = new SurveyTracker;
	var newSurveyButton = document.getElementById('new-survey');
	newSurveyButton.addEventListener('click', function(event) {
		event.preventDefault();/*
		var newSurveyButtonWrapper = document.getElementById('survey-list');
		newSurveyButtonWrapper.insertAdjacentHTML('beforeend', '<li class="nav-item"><a class="nav-link" data-toggle="pill" contenteditable href="#surveyTable-pane-' + surveyTracker.survey + '">Participant ' + surveyTracker.survey + '</a></li>');
		var newSurveyTable = document.createElement('table');
		newSurveyTable.id = 'surveyTable-' + surveyTracker.survey;
		newSurveyTable.classList.add('table');
		newSurveyTable.classList.add('assessment-table');
			var newTbody = document.createElement('tbody');
			newSurveyTable.appendChild(newTbody);
		var surveyPaneContent = document.querySelector('#survey-pane > .tab-content');
		var pillPane = document.createElement('div');
			pillPane.id = 'surveyTable-pane-' + surveyTracker.survey;
			pillPane.classList.add('tab-pane');
			pillPane.classList.add('fade');
			pillPane.appendChild(newSurveyTable);
		surveyPaneContent.appendChild(pillPane);*/
		buildAssessments(overlays, surveyTracker);
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
		place.name = placeSelect.value.replace(' CDP', '');
		var currentPlace = placeSelect.querySelector(':checked');
		place.code = currentPlace.dataset.placefp;
		place.type = currentPlace.dataset.type;
		document.getElementById('tab-switcher').hidden = false;
		document.getElementById('survey-pane').hidden = false;
		surveyTracker = new SurveyTracker;
		buildAssessments(overlays, surveyTracker);
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
			document.getElementById('report-header').hidden = false;
			populateDataFramework(profile.data);
		}).catch(function(error) {
			console.log('There has been a problem with your fetch operation: ' + error.message);
		});
		initMap(state.abbreviation,county.name,place.name);
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
	

	var ctx = document.getElementById("survey-radar-chart").getContext('2d');
	var surveyRadarChart = new Chart(ctx, {
		type: 'radar',
		data: {
			labels: [],
			datasets:[
				{label:
					"Survey Assessment Results",
					"data":[],
					"fill":true,
					"backgroundColor":"rgba(54, 162, 235, 0.2)",
					"borderColor":"rgb(54, 162, 235)",
					"pointBackgroundColor":"rgb(54, 162, 235)",
					"pointBorderColor":"#fff",
					"pointHoverBackgroundColor":"#fff",
					"pointHoverBorderColor":"rgb(54, 162, 235)"
		}]},
		options:{
			"elements":{
				"line":
					{"tension":0,"borderWidth":3}
			},
			"scale": {
				"ticks": {
					"stepSize": 0.5,
					"suggestedMin": -2,
					"suggestedMax": 2
				}
			}
		}
	});		

	$('#activate-vulnerability-tab').on('shown.bs.tab', function (e) {
		var datapoints = [];
		surveyTracker.categories.forEach(function(category) {
			var values = null;
			var categoryQuestions = document.querySelectorAll("[data-category='" + category + "']");
			var total = categoryQuestions.length;
			console.log(total);
			categoryQuestions.forEach(function(question) {
				var selectedOption = question.querySelector('input:checked');
				if(selectedOption) {
					var value = question.querySelector('input:checked').value;
					console.log("Selected Value: " + value);
					if(value) {
						values += parseInt(value);
						console.log("Values added to: " + values);
					}
				}
			});
			if(values !== null) {
				datapoints.push(values/total);
				console.log(datapoints);
			} else {
				datapoints.push(null);
				console.log(datapoints);
			}
		});
		surveyRadarChart.data.labels = surveyTracker.categories;
		surveyRadarChart.data.datasets[0].data = datapoints;
		console.log("Final Array: " + datapoints);
		surveyRadarChart.update();
		console.log(surveyRadarChart);
	});	

	$('#activate-map-tab').on('shown.bs.tab', function (e) {
		google.maps.event.trigger(infrastructureMap, 'resize');
		console.log(JSON.stringify(infrastructureMap.getCenter()));
		console.log('Map resized');
		infrastructureMap.fitBounds(jurisdictionBounds);
	})
	
	var multiselects = document.getElementsByClassName('multiselect');
	for (var i = 0, len = multiselects.length; i < len; i++) {
		multiselects[i].addEventListener('click', function(event) {
			event.stopPropagation();
		});
	}
	
    var nodes = new vis.DataSet([
        {id: 1, label: 'Node 1'},
        {id: 2, label: 'Node 2'},
        {id: 3, label: 'Node 3'},
        {id: 4, label: 'Node 4'},
        {id: 5, label: 'Node 5'}
    ]);

    // create an array with edges
    var edges = new vis.DataSet([
        {from: 1, to: 3},
        {from: 1, to: 2},
        {from: 2, to: 4},
        {from: 2, to: 5}
    ]);

    // create a network
    var ecomapContainer = document.getElementById('ecomap');

    // provide the data in the vis format
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {
		height: '500px',
		width: '1070px'
	};
    var ecomap = new vis.Network(ecomapContainer, data, options);
});

function initMap(state,county,place) {
	var address = "";
	if(place !== 'None') {
		address = place + ", " + state + " USA";
	} else {
		address = county + ", " + state + " USA";
	}		
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == 'OK') {
			console.log(JSON.stringify(results[0]));
			jurisdictionBounds = new google.maps.LatLngBounds();
			jurisdictionBounds = results[0].geometry.viewport;
			infrastructureMap = new google.maps.Map(document.getElementById('map'), {
				center: results[0].geometry.location,
				zoom: 18
  			});
			console.log(JSON.stringify(jurisdictionBounds));
			console.log(JSON.stringify(results[0].geometry.location));
			//infrastructureMap.fitBounds(jurisdictionBounds);
			console.log(JSON.stringify(infrastructureMap.getCenter()));
			return;
		} else {
			console.log('Geocode was not successful for the following reason: ' + status);
			infrastructureMap = new google.maps.Map(document.getElementById('map'), {
				center: {lat: 39.5, lng: -98.35},
				zoom: 5
  			});
		}
		return;
	});
}

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
				if(dataTable[tableName]["dataset"].length === 0) {
					var placeholderDatapoints = ["","",""];
					//for(var phi = 0; len = dataTable[tableName]["variables"].length; phi++) {
					//	placeholderDatapoints.push("");
					//}
					dataTable[tableName]["dataset"] = [
						{"name":"", "datapoints":placeholderDatapoints}
					];
				}
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
								plusIcon.addEventListener('click', cloneRow);
							rowControls.appendChild(plusIcon);
							var minusIcon = document.createElement('i');
								minusIcon.classList.add('material-icons');
								minusIcon.classList.add('remove-row');
								//minusIcon.classList.add('float-right');
								var minusIconText = document.createTextNode('remove_circle');
								minusIcon.appendChild(minusIconText);
								minusIcon.addEventListener('click', killRow);
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

var cloneRow = function(event) {
	console.log(event.target.parentNode.parentNode);
	var referenceNode = event.target.parentNode.parentNode;
	var clonedNode = referenceNode.cloneNode(true);
	var contentEditables = clonedNode.querySelectorAll('[contenteditable]');
	for (var i = 0; i < contentEditables.length; i++) {
		contentEditables[i].innerHTML = '';
	}
	newPlusIcon = clonedNode.querySelector('.add-row').addEventListener('click', cloneRow);
	newMinusIcon = clonedNode.querySelector('.remove-row').addEventListener('click', deleteRow);
	referenceNode.parentNode.insertBefore(clonedNode, referenceNode.nextSibling);
}

var killRow = function(event) {
	var killRow = event.target.parentNode.parentNode;
	console.log(killRow);
	killRow.parentNode.removeChild(killRow);
}

class Assessment {
    constructor(overlays) {
		this["Connection and Caring"] = [
			{question: "People in my community feel like they belong to the community.", type: "likert"},
			{question: "People in my community are committed to the well-being of the community.", type: "likert"},
			{question: "People in my community have hope about the future.", type: "likert"},
			{question: "People in my community help each other.", type: "likert"},
			{question: "My community treats people fairly no matter what their background is.", type: "likert"}
		];
		this["Resources"] = [
			{question: "My community supports programs for children and families.", type: "likert"},
			{question: "My community has resources it needs to take care of community problems (resources include, for example, money, information, technology, tools, raw materials, and services).", type: "likert"},
			{question: "My community has effective leaders.", type: "likert"},
			{question: "People in my community are able to get the services they need.", type: "likert"},
			{question: "People in my community know where to go to get things done.", type: "likert"}
		];
		this["Transformative Potential"] = [
			{question: "My community works with organizations and agencies outside the community to get things done.", type: "likert"},
			{question: "People in my community communicate with leaders who can help improve the community.", type: "likert"},
			{question: "People in my community work together to improve the community.", type: "likert"},
			{question: "My community looks at its successes and failures so it can learn from the past.", type: "likert"},
			{question: "My community develops skills and finds resources to solve its problems and reach its goals.", type: "likert"},
			{question: "My community has priorities and sets goals for the future.", type: "likert"}
		];
		this["Disaster Management"] = [
			{question: "My community tries to prevent disasters.", type: "likert"},
			{question: "My community actively prepares for future disasters.", type: "likert"},
			{question: "My community can provide emergency services during a disaster.", type: "likert"},
			{question: "My community has services and programs to help people after a disaster.", type: "likert"}
		];
		this["Information and Comm."] = [
			{question: "My community keeps people informed (for example, via television, radio, newspaper, Internet, phone, neighbors) about issues that are relevant to them.", type: "likert"},
			{question: "If a disaster occurs, my community provides information about what to do.", type: "likert"},
			{question: "I get information/communication through my community to help with my home and work life.", type: "likert"},
			{question: "People in my community trust public officials.", type: "likert"}
		];
		
		if(overlays.includes("radicalization")) {
			this["People"] = [
				{question: "<b>Social Networks & Trust:</b> Trusting relationships among community members built upon a shared history, mutual obligations, opportunities to exchange information, and that foster the formation of new, and strengthen existing, connections.", type: "likert"},
				{question: "<b>Participation & Willingness to Act for the Common Good:</b> Individual capacity, desire, and ability to participate, communicate, and work to improve the community; meaningful participation by local/indigenous leadership; involvement in the community such as through local community and social organizations and participation in the political process.", type: "likert"},
				{question: "<b>Norms & Culture:</b> Broadly accepted behaviors to which people generally conform that promote health, wellness and safety among all community residents; discourage behaviors that inflict emotional or physical distress on others; and reward behaviors that positively affect others; Norms include values and practices stemming from belief systems that are often linked to those core personal characteristics from which identity derives.", type: "likert"}
			];
			this["place"] = [
				{question: "<b>What’s Sold & How It’s Promoted:</b> availability and promotion of safe, healthy, affordable, culturally appropriate products and services (e.g. food, pharmacies, books and school supplies, sports equipment, arts and crafts supplies, and other recreational items); and the limited promotion, availability, and concentration of potentially harmful products and services (e.g. tobacco, firearms, alcohol, and other drugs).", type: "likert"},
				{question: "<b>Look, Feel & Safety:</b> Surroundings that are wellmaintained, appealing, perceived to be safe and culturally inviting for all residents.", type: "likert"},
				{question: "<b>Parks and Open Space:</b> Availability and access to safe, clean parks, green space and open areas that appeal to interests and activities across the generations.", type: "likert"},
				{question: "<b>Getting Around:</b> Availability of safe, reliable, accessible and affordable ways for people to move around, including public transit, walking, biking and using devices that aid mobility.", type: "likert"},
				{question: "<b>Housing:</b> High-quality, safe and affordable housing that is accessible for residents with mixed income levels.", type: "likert"},
				{question: "<b>Air, Water & Soil:</b> Safe and non-toxic water, soil, indoor and outdoor air.", type: "likert"},
				{question: "<b>Arts & Cultural Expression:</b> Abundant opportunities exist within the community for cultural and artistic expression and participation, and for positive cultural values to be expressed through the arts; and arts and culture positively reflect and value the backgrounds of all community residents.", type: "likert"}
			];
			this["Opportunity"] = [
				{question: "<b>Living Wages and Local Wealth:</b> Local ownership of assets; accessible local employment that pays living wages and salaries; and access to investment opportunities.", type: "likert"},
				{question: "<b>Education:</b> High quality, accessible education and literacy development for all ages that effectively serves all learners.", type: "likert"}
			];
		}
	}
}

class SurveyTracker {
	constructor(overlays) {
		this.question = 1,
		this.questions = [],
		this.survey = 1,
		this.categories = []
	}
}

function buildAssessments(overlays, surveyTracker) {
	var assessment = new Assessment(overlays);
	surveyTracker.categories = [];
	var questionManifest = [];
	var newSurveyButtonWrapper = document.getElementById('survey-list');
		var previousActive = newSurveyButtonWrapper.querySelector('.active');
		if(previousActive !== null) {
			previousActive.classList.remove('active');	
		}
		newSurveyButtonWrapper.insertAdjacentHTML('beforeend', '<li class="nav-item"><a class="nav-link active" data-toggle="pill" contenteditable href="#surveyTable-pane-' + surveyTracker.survey + '">Participant ' + surveyTracker.survey + '</a></li>');
		var newSurveyTable = document.createElement('table');
			newSurveyTable.id = 'surveyTable-' + surveyTracker.survey;
			newSurveyTable.classList.add('table');
			newSurveyTable.classList.add('assessment-table');
				var newTbody = document.createElement('tbody');
			newSurveyTable.appendChild(newTbody);
		var surveyPaneContent = document.querySelector('#survey-pane > .tab-content');
		var pillPane = document.createElement('div');
			pillPane.id = 'surveyTable-pane-' + surveyTracker.survey;
			pillPane.classList.add('tab-pane');
			pillPane.classList.add('fade');
			if(surveyTracker.survey === 1) {
				pillPane.classList.add('show');
				pillPane.classList.add('active');
			}
			pillPane.appendChild(newSurveyTable);
		surveyPaneContent.appendChild(pillPane);
	for (const key of Object.keys(assessment)) {
		surveyTracker.categories.push(key);
		var size = Object.keys(assessment[key]).length;
		var questionIterator = 0;
		for (const q of assessment[key]) {
			if(surveyTracker.questions.length === 0) {questionManifest.push([q.question.replace(/<{1}[^<>]{1,}>{1}/g," ")]);}
			var tr = buildAssessmentQuestion(q, questionIterator, size, key, surveyTracker);
			//surveyTableBody.appendChild(tr);
			newTbody.appendChild(tr);
			surveyTracker.question++;
			questionIterator++;
		}
	}
	surveyTracker.survey++;
	if(surveyTracker.questions.length === 0) {surveyTracker.questions = questionManifest;}
}

function buildAssessmentQuestion(q, questionIterator, subsectionSize, key, surveyTracker) {
	var questionRow = document.createElement("tr");
	if (questionIterator === 0) {
		var questionHeader = document.createElement("th");
		if (surveyTracker.question === 1) {
			questionHeader.classList.add('first-row');
		}
		questionHeader.rowSpan = subsectionSize;
		var headerTitle = document.createTextNode(key);
		questionHeader.appendChild(headerTitle);
		questionRow.appendChild(questionHeader);
	}
	var titleTd = document.createElement("td");
	titleTd.classList.add('survey-question');
	//var questionTitle = document.createTextNode(q.question);
	titleTd.innerHTML = q.question;
	//titleTd.appendChild(questionTitle);
	questionRow.appendChild(titleTd);
	var inputTd = document.createElement("td");
	inputTd.classList.add('survey-input');
	inputTd.dataset.category = key;
	if (surveyTracker.question === 1) {
		inputTd.classList.add('first-row');
	}
	if (q.type === "likert") {
		var stronglyDisagree = document.createElement("input");
			stronglyDisagree.type = "radio";
			stronglyDisagree.name = `survey-${surveyTracker.question}`;
			stronglyDisagree.value = "-2";
			//stronglyDisagree.id = "strongly-disagree-" + surveyTracker.question;
		//inputTd.appendChild(stronglyDisagree);
		var sdLabel = document.createElement("label");
			//sdLabel.htmlFor = "strongly-disagree-" + surveyTracker.question;
				var sdLabelText = document.createTextNode("Strongly Disagree");
			sdLabel.appendChild(stronglyDisagree);
			sdLabel.appendChild(sdLabelText);
		inputTd.appendChild(sdLabel);

		var disagree = document.createElement("input");
			disagree.type = "radio";
			disagree.name = `survey-${surveyTracker.question}`;
			disagree.value = "-1";
			//disagree.id = "disagree-" + surveyTracker.question;
		//inputTd.appendChild(disagree);
		var dLabel = document.createElement("label");
			//dLabel.htmlFor = "disagree-" + surveyTracker.question;
				var dLabelText = document.createTextNode("Disagree");
			dLabel.appendChild(disagree);
			dLabel.appendChild(dLabelText);
		inputTd.appendChild(dLabel);
		
		var neutral = document.createElement("input");
			neutral.type = "radio";
			neutral.name = `survey-${surveyTracker.question}`;
			neutral.value = "0";
			//neutral.id = "neutral-" + surveyTracker.question;
		//inputTd.appendChild(neutral);
		var nLabel = document.createElement("label");
			//nLabel.htmlFor = "neutral-" + surveyTracker.question;
				var nLabelText = document.createTextNode("Neutral");
			nLabel.appendChild(neutral);
			nLabel.appendChild(nLabelText);
		inputTd.appendChild(nLabel);
		
		var agree = document.createElement("input");
			agree.type = "radio";
			agree.name = `survey-${surveyTracker.question}`;
			agree.value = "1";
			//agree.id = "agree-" + surveyTracker.question;
		//inputTd.appendChild(agree);
		var aLabel = document.createElement("label");
			//aLabel.htmlFor = "agree-" + surveyTracker.question;
				var aLabelText = document.createTextNode("Agree");
			aLabel.appendChild(agree);
			aLabel.appendChild(aLabelText);
		inputTd.appendChild(aLabel);
		
		var stronglyAgree = document.createElement("input");
			stronglyAgree.type = "radio";
			stronglyAgree.name = `survey-${surveyTracker.question}`;
			stronglyAgree.value = "2";
			//stronglyAgree.id = "agree-" + surveyTracker.question;
		//inputTd.appendChild(stronglyAgree);
		var saLabel = document.createElement("label");
			//saLabel.htmlFor = "strongly-agree-" + surveyTracker.question;
				var saLabelText = document.createTextNode("Strongly Agree");
			saLabel.appendChild(stronglyAgree);
			saLabel.appendChild(saLabelText);
		inputTd.appendChild(saLabel);
	}
	questionRow.appendChild(inputTd);
	return questionRow;
}

function addressLookup(event) {
	console.log(event.target);
	if(event.target.dataset.address) {
		if(event.target.dataset.address === event.target.textContent) {
			return;
		} else {
			event.target.dataset.address = event.target.textContent;
		}
	} else {
		event.target.dataset.address = event.target.textContent;
	}
	console.log(event.target.dataset.address);
}
