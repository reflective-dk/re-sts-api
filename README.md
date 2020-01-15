# re-sts-api #

API for using KOMBIT Støttesystemerne (STS) with Reflective.

## Configuration

The endpoints of services have default values, but you can override them in the
constructor.

```js
const StsApi = require('re-sts-api');
var stsApi = new StsApi({
  stsHost: 'http://some-sts-host'  // this option must be specified
});
```

## Usage

Arguments and objects passed in and out of this API are instances of the classes
found in `re-models/models/sts-*/classes`. They follow the usual Reflective
object and snapshot structure.

```js
stsApi.readOrgUnits(orgUnitIds)
  => // returns a promise that resolves to a map of objects
  {
      'some-uuid': {
          id: 'some-uuid',
          snapshot: {
              name: 'Name of Org Unit',
              class: { id: '82c6cf1a-8992-4eb3-ba54-f813888ba98f' },
              Overordnet: { id: 'overordnet-uuid' }
          }
      }
  }
```
