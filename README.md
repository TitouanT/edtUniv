# edtUniv
application to help student accessing their timetable

# the API

All request response formated like this:
```js
{
	"status": int,
	"data": {} // the format of data is specified for each endpoints below
}

```
Only the data object is specified afterwards.

The type `date` is a string with a special format: `yyyymmddThhmmssZ` (ex: `20180912T214850Z`, but why? -> this is the format used by the university and its very simple to sort)

## /ressources

**GET**

Retrieve all the known ressources

```js
data = {
	"ressources": [ // sorted by id
		{
			"id": int,
			"name": string
		},
	]
}
```

## /meta

**GET**

Get the metadata on a particular ressource

```js
payload = {
	"id": int
}
data = {
	"name": string,
	"lastUpdate": date
}
```

**POST**

Propose a name for a particular ressource.


```js
payload = {
	"id": int,
	"name": string
}
```


## /data

**GET**

1. get all the data for this ressource
```js
payload = {
	"id": int,
}
```

2. get only the updated data
```js
payload = {
	"id": int,
	"since": date
}
```

In both cases you will receive:
```js
data = {
	"items": [ // sorted by date
		{
			"uid":string // a unique identifier
			"dtstart":date, // starting date
			"dtend":date, // ending date
			"lastmodified":date,
			"summary":string, // usually the name of the course
			"location":string, // the name of the building and the room number
			"group":[string], // which groups of student (maybe more than 1)
			"teacher":[string], // which teacher (maybe more than 1)
		}
	]
}

```
