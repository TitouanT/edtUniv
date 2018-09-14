# edtUniv
application to help student accessing their timetable

# the API

All request response are of this format:
```js
{
  "status":, // the http response code
  "data": {} // the format of data is specified for each endpoints below
}

```
Only the data object is specified afterwards.

The type date is a string with a special format: `YYYY:MM:DD:hh:mm:ss`

## /ressources

**GET**
```js
data = {
  "ressources": [
    {
      "id":(int),
      "name":(string)
    },
  ]
}
```

## /meta

**GET**
```js
payload = {id(int)}
data = {
  "name":(string),
  "lastUpdate":(date)
}
```

**POST**
```js
payload = {"id":(int), "name":(string)}
```


## /


## /since
