<img width="602" alt="Screen Shot 2021-03-31 at 16 44 59" src="https://user-images.githubusercontent.com/17465543/113125237-9a58b880-9240-11eb-9a12-69d92d80f956.png">

# GETTING STARTED

## INTRODUCTION

Warlock adalah tool yang memungkinkan frontend developer untuk melakukan mocking API.

Tidak seperti mocking library pada umumnya, Warlock memudahkan dalam melakukan mocking di baik pada API sudah ada/siap maupun belum ada/siap sekalipun.

### HOW IT WORKS

Tedapat pada [RFC #16](https://docs.google.com/document/d/13-wPV_9RLVPHSVocu8aiV5LwckOstLq3zpBXzidPxJk/edit#)

## INSTALLATION

Warlock dapat diinstall sebagai dev project atau global

### <a name="installation"></a>Install Package

#### Install as dev dependency

```bash
# Using npm
npm install --save-dev warlock

# Using Yarn
yarn add --dev warlock
```

#### Install globally

```bash
# Using npm
npm install --global warlock

# Using Yarn
yarn global add warlock
```

### Add Warlock Config File

Tambahkan file dengan `.warlock.yaml` untuk menyimpan konfigurasi. Untuk mempelajari lebih lanjut mengenai konfigurasi pada Warlock, baca bagian [Configuration File](#configuration) atau [Quickstarts](#quickstarts)

## <a name="configuration"></a>Configuration File

Struktur config file Warlock adalah sebagai berikut

```json
rest:
^   sources:
|       - name: Poke API
| +-----> origin: https://pokeapi.co
| |       transforms:
| | +--->     /api/v2/pokemon:
| | | +->         get:
| | | | +--->         - field: root.results.[].name
| | | | |               resolvers:
| | | | | +->               - faker: name.firstName
| | | | | |
| | | | | |
| | | | | +- tipe resolver yang akan di apply pada path yang didefinisikan [faker, json, path]
| | | | +--- field path yang akan dilakukan transform dengan apply resolver
| | | +----- method [get, post, put, patch, delete]
| | +------- endpoint path
| +--------- origin atau API service URL
+----------- handler, saat ini Warlock baru bisa mensupport REST API (GraphQL soon).
```

## <a name="resolvers"></a>Resolvers

Resolver yang dissuport oleh Warlock saat ini, antara lain:

### Faker

Warlock built in dengan [faker.js](https://github.com/marak/Faker.js/), dimana kita dapat dengan mudah melakukan data generation. Seluruh [API method](https://github.com/marak/Faker.js/#api-methods) yang terdapat pada faker.js dapat diapply melalui resolver. Berikut ini adalah key value pair dari faker resolver.

```yaml
faker: <nama_faker_api_method>
```

contoh implementasi pada config file:

```yaml
rest:
  sources:
    - name: Poke API
      origin: https://pokeapi.co
      transforms:
        /api/v2/pokemon:
          get:
            - field: root.results.[].name
              resolvers:
                - faker: name.firstName
            - field: root.results.[].name
              resolvers:
                - faker: internet.url
```

### JSON

JSON resolver dapat digunakan sebagai data seed. Berikut ini adalah key value pair dari JSON resolver.

```yaml
json: <relative_path_terhadap_json_file>
```

contoh implementasi pada config file:

```yaml
rest:
  sources:
    - name: Poke API
      origin: https://pokeapi.co
      transforms:
        /api/v2/pokemon:
          get:
            - field: root
              resolvers:
                - json: ./my-relative-path-to-the-file.json
```

### Javascript

JS Resolver merupakan sebuah resolver berupa JS function dimana kita dapat mengimplementasikan logic-logic susuai dengan kebutuhan. JS resolver function akan menerima dua buah argumen:

1. parent
2. context

```yaml
path: <relative_path_terhadap_js_file>
```

contoh implementasi JS function sebagai resolver

```js
function randomInRange(from, to) {
  var r = Math.random();
  return Math.floor(r * (to - from) + from);
}

const resolver = (parent, ctx) => {
  if (!ctx.req.body.mandatory) {
    ctx.res.set('Content-Type', 'application/json');
    return ctx.res.status(400).json({
      body: {
        success: false,
        code: 50001,
      },
    });
  }

  const response = {
    id: randomInRange(1000, 9999),
    ...parent,
    ...ctx.req.body,
  };
  global.warlock = response;

  return response;
};

module.exports = resolver;
```

contoh implementasi pada config file:

```yaml
rest:
  sources:
    - name: Poke API
      origin: https://pokeapi.co
      transforms:
        /api/v2/pokemon:
          get:
            - field: root
              resolvers:
                - path: ./my-relative-path-to-the-file.js
```

# <a name="quickstarts"></a>Quickstarts

### 1) Install Warlock

Install warlock pada local machine, menggunakan langkah pada bagian [ini](#installation)
Server Warlock secara default akan berjalan di port 4000

### 2) Configuration Setup

Gunakan konfigurasi file dibawah dan simpan di dalam `.warlock.yaml`

```yaml
rest:
  sources:
    - name: Poke API
      origin: https://pokeapi.co
      transforms:
        /api/v2/pokemon:
          get:
            - field: root.results.[0].name
              resolvers:
                - faker: name.firstName
```

Konfigurasi diatas artinya, lakukan transformation:

1. pada API Service yang dengan alamat url https://pokeapi.co, lalu
2. pada endpoint `GET /api/v2/pokemon`, lalu
3. pada field `name` di index pertama (index-0) dari field `results`, lalu
4. gunakan `faker` resolver dengan API method yang digunakan adalah `name.firstName`

### 3) Run Warlock

Jalankan Warlock dengan perintah dibawah ini:

```bash
warlock serve
```

pastikan config file berada di lokasi yang sama

### 4) Hit endpoint

Eksekusi command curl di bawah ini:

```
curl --location --request GET 'http://localhost:4000/https://pokeapi.co/api/v2/pokemon' \
```

Response original dari endpoint `GET /api/v2/pokemon` adalah sebagai berikut:

```json
{
    "count": 1118,
    "next": "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
    "previous": null,
    "results": [
        {
            "name": "bulbasaur",
            "url": "https://pokeapi.co/api/v2/pokemon/1/"
        },
        ...
    ]
}
```

Perhatikan response yang telah ditransform oleh Warlock. Pada index ke-0 field `results`, value dari field `name` tidak lagi `bulbasaur`, karena pada konfigurasi yang digunakan saat ini kita mendefine bahwa field path `root.results.[0].name` akan diapply faker resolver dengan API method yang digunakan `name.firstName`

### 5) Play with Faker Resolver: Update field configuration

Ubah konfigurasi Warlock pada bagian `field`

```diff
rest:
  sources:
    - name: Poke API
      origin: https://pokeapi.co
      transforms:
        /api/v2/pokemon:
          get:
-           - field: root.results.[0].name
+           - field: root.results.[].name
              resolvers:
                - faker: name.firstName
```

### 6) Play with Faker Resolver: Rehit endpoint after update field configuration

Eksekusi kembali command curl di bawah ini:

```
curl --location --request GET 'http://localhost:4000/https://pokeapi.co/api/v2/pokemon' \
```

Perhatikan kembali response yang telah ditransform oleh Warlock. Value dari field `name` pada seluruh elemen di dalam field `results` tidak lagi berisikan nama pokemon, karena Warlock meng-apply faker resolver dengan API method yang digunakan `name.firstName`

### <a name="quickstarts-7"></a>7) Play with JSON Resolver: Update resolver configuration

Siapkan file `json` terlebih dahulu dengan nama `example.json` lalu simpan di lokasi yang sama dengan config file

```
// example.json

{
  foo: "bar"
}
```

Ubah konfigurasi Warlock seperti berikut

```diff

rest:
  sources:
    - name: Poke API
      origin: https://pokeapi.co
      transforms:
        /api/v2/pokemon:
          get:
            - field: root.results.[].name
               resolvers:
                 - faker: name.firstName
+           - field: root.results.[].url
+              resolvers:
+                - json: ./example.json
```

Pada tahap ini kita akan mencoba melakukan transforming field url dengan meng-apply json resolver dengan value yaitu relative path terhadap file json yang baru kita buat

### 8) Play with JSON Resolver: Rehit endpoint after update field configugragtion

Eksekusi kembali command curl di bawah ini:

```
curl --location --request GET 'http://localhost:4000/https://pokeapi.co/api/v2/pokemon' \
```

Response original dari endpoint `GET /api/v2/pokemon` adalah sebagai berikut:

```json
{
    "count": 1118,
    "next": "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
    "previous": null,
    "results": [
        {
            "name": "bulbasaur",
            "url": "https://pokeapi.co/api/v2/pokemon/1/"
        },
        ...
    ]
}
```

Perhatikan kembali response yang telah ditransform oleh Warlock. Value dari field `url` yang aslinya berupa url `string` ditransform menjadi sebuah `object` menjadi seperti berikut:

```json
{
    "count": 1118,
    "next": "https://pokeapi.co/api/v2/pokemon?offset=20&limit=20",
    "previous": null,
    "results": [
        {
            "name": "bulbasaur",
            "url": {
              "foo": "bar"
            }
        },
        ...
    ]
}
```

Berikut penjelasannya, pengubahan config di [langkah 7](#quickstarts), kita meng-apply json resolver pada field path `root.results.[].url` yang diarahkan ke file json `example.json`.
