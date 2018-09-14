function readFile(filename) {
	return new Promise(function(resolve, reject) {
		fs.readFile(filename, (data, err) => {
			if (err) reject(err);
			else resolve(data);
		})
	});
}

async function parse(filename) {
	raw = null;
	try {
		raw = await readFile(filename);
	} catch(err) {
		return Promise.reject(err);
	}

	return Promise.resolve(raw);
}

module.exports = {
	parse
}
