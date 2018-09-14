
fs = require('fs');

function readFile(filename) {
	return new Promise(function(resolve, reject) {
		fs.readFile(filename, (err, data) => {
			if (err) reject(err);
			else resolve(data);
		})
	});
}

// this an hardcoded parser who takes only what matters
async function parse(filename) {

	// First read the file
	let raw;
	try {
		raw = await readFile(filename);
	} catch(err) {
		return Promise.reject(err);
	}

	// convert the Buffer to a string and clean it up a bit
	// the first replace is for the description who gets \\n as a separator
	// the second one is to remove all the new line marker
	const rawstr = raw.toString().replace(/\\n/g, ';').replace(/\r\n/g, '@');

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

	// return Promise.resolve(chunks.filter(c => c.indexOf('ADE6070726f6a6574756e6976323031382d323031392d31353831342d302d3130@') > -1));


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
			if ((/[0-9]/).test(str)) item.groups.push(str);
			else item.teachers.push(str);
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



//
// module.exports = {
// 	parse
// }
