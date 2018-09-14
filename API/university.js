/* this module handle the link to the university server */
const http = require('http');


const buildUrl = (function () {
	const first = 'http://edt.univ-lemans.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=';
	const last = '&projectId=1&calType=ical&nbWeeks=200';

	return function(ressource) {
		return `${first}${ressource}${last}`;
	};
})();

// this an hardcoded parser who takes only what matters
function parse(rawstr) {


	// the first replace is for the description who gets \\n as a separator
	// the second one is to remove all the new line marker
	// and the third because sometime there is some \\ that I dont want
	rawstr = rawstr.replace(/\\n/g, ';').replace(/\r\n/g, '@').replace(/\\/g,'');

	// split the string into a series of key, value, key, value, ...
	const keyval = rawstr.split(/([A-Z\-]+):/);

	// now separate all the different event into their own chunk
	const chunks = []
	let i = 2; // avoid the first BEGIN key because it's not part of an event
	while(i < keyval.length) {
		if(keyval[i]!='BEGIN') {
			i++;
			continue;
		}

		// we got the begining of an event
		const first = i + 2;
		let j = first;

		while(j < keyval.length && keyval[j] != 'END') j++;
		const chunk = keyval.slice(first, j);
		chunks.push(chunk);
		i = j+1;
	}

	// now we need to transform every chunk into a timetable item
	const data = [];

	chunks.map(chunk => {
		const item = {};
		for (let i = 0; i < chunk.length; i+=2) {
			const key = chunk[i].replace(/\-/g, '_').toLowerCase();
			const value = chunk[i+1].replace('@', '').trim(); // deleting all the '@'
			item[key] = value;
		}

		// get the groups and teachers
		const desc = item.description
			.split(';') // split on the fields separator
			.filter(str => str.length > 0) // remove the empty fields
			.slice(0, -1); // get rid of the exported field

		// put them in the right place
		item.groups = [];
		item.teachers = [];

		desc.forEach(str => {
			str = str.trim();
			if (!(/[0-9]/).test(str)) item.teachers.push(str);
			else if (!(/[:]/).test(str))item.groups.push(str);
		});

		// delete unwanted data
		delete item.description; // we used that ! and now we can let it go
		delete item.dtstamp; // they all get the same value every time
		delete item.created; // always "19700101T000000Z" lol
		delete item.last_modified; // always the same as dtstamp;
		delete item.sequence; // always the same for all

		// add this newly created item to our data list
		data.push(item);
	});

	// now sort the array by starting date
	data.sort((a,b) => {
		a = a.dtstart;
		b = b.dtstart;
		return (a>b) ? 1 : (a<b) ? -1 : 0;
	});
	return Promise.resolve(data);
}


const university = {};

university.get = function(ressource) {
	return new Promise(function(resolve, reject) {
		req = http.request(buildUrl(ressource), function(res) {
			let response = "";
			res.setEncoding("utf8");
			res.on('data', block => response += block);
			res.on('end', () => resolve(parse(response)));
		});
		req.on('error', reject);
		req.end();
	});
}

module.exports = university;

// university.get(1189)
// .then(d => {
// 	console.log(d);
// })
// .catch(e => console.log(e));
//
