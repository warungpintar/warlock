<img width="602" alt="Screen Shot 2021-03-31 at 16 44 59" src="https://user-images.githubusercontent.com/17465543/113125237-9a58b880-9240-11eb-9a12-69d92d80f956.png">

# GETTING STARTED

## INTRODUCTION

Warlock adalah tool untuk melakukan API mocking. Tidak seperti mocking library pada umumnya, Warlock memudahkan dalam melakukan mocking di baik pada API sudah ada/siap maupun belum ada/siap sekalipun.

### HOW IT WORKS

Tedapat pada [RFC #16](https://docs.google.com/document/d/13-wPV_9RLVPHSVocu8aiV5LwckOstLq3zpBXzidPxJk/edit#)

## INSTALLATION

Warlock dapat diinstall sebagai dev project atau global

### Building warlock manually (recommended)

Langkah-langkah dapat dilihat di [sini](#contributing)

### <a name="installation"></a>Install Package from Registry

> **Note:** might not works [Issue #1](https://gitlab.warungpintar.co/warungpintar/warlock/-/issues/1)

Tambahkan npm creadential dan juga registry agar untuk dapat melakukan pulling package dari private npm registry.

#### Menggunakan npm config file

Tambahkan file `.npmrc` pada root project

```
@warungpintar:registry=https://gitlab.warungpintar.co/api/v4/packages/npm/
//gitlab.warungpintar.co/api/v4/packages/npm/:_authToken=y25R2BFzM5HtGfNFaCZn
```

Jalankan `yarn config list` dan pastikan registry dengan scope @warungpintar telah terdaftar

#### Install as dev dependency

```bash
yarn add --dev @warungpintar/warlock
```

#### Install globally

```bash
yarn global add @warungpintar/warlock
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

### <a name="command"></a> 3) Run Warlock

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

# <a name="quickstarts"></a>Run Warlock on Docker

Pastikan [docker](https://docs.docker.com/get-docker/) telah tersetup pada local machine

### 1) Build Warlock docker image

```sh
docker build -t warlock .
```

### 2) Run warlock in docker container

Warlock mengexpose 2 (dua) buah port yaitu port `4000` dan `3000`. Untuk itu kita perlu melakukan publish container port terhadap host port, dalam contoh dibawah ini kita menggunakan port yang sama antara host dan container, akan tetapi kita dapat menggunakan port lain pada host.

#### Using default config

```
docker run -p 4000:4000 -p 3000:3000 warlock
```

#### Using your config

Untuk dapat menjalankan Warlock container dengan config sendiri, maka kita harus melakukan bind mount host volume dengan container volume. Path Warlock config pada container berada di `/usr/src/app/config`, sehingga yang perlu kita lakukan adalah melakukan bind mount path pada host yang berisi config Warlock kepada path container tersebut.

Sebagai contoh, config Warlock kita berada pada `/Users/warungpintar/my_project/warlock-config` dengan struktur directory sebagai berikut ini

```
my_project
+- warlock-config
   +- .warlock.yaml
   +- resolvers
      +- my-resolver.js
```

```yaml
# .warlock.yaml
rest:
  sources:
    - name: Poke API
      origin: https://pokeapi.co
      transforms:
        # (origin) => transform by field(faker) => new Responses(origin+faker_field)
        /api/v2/pokemon:
          get:
            - field: root.results.[].name
              resolvers:
                - path: ./config/resolvers/my-resolver.js
```

Setelah itu, jalan kan container dengan command sebagai berikut:

```
docker run -p 4000:4000 -p 3000:3000 -v /Users/warungpintar/my_project/warlock-config:/usr/src/app/config warlock
```

## <a name="contributing"></a> Contributing

Jika menemukan masalah dengan tool ini, silahkan open issue di repo ini. Contributions are more than welcome! :)

### Build Warlock

1. Clone repo
   ```
   git clone https://gitlab.warungpintar.co/warungpintar/warlock.git
   ```
2. Install all dependency
   ```
   yarn install
   ```
3. build package
   ```
   yarn build
   ```

### Install a Local Warlock

#### As dev dependency

Pastikan Warlock telah di build, lalu install warlock pada playground project sebagai dev dependency dengan perintah berikut:

```
npm install <path_to_warlock> -D
```

Jalankan Warlock dengan perintah berikut:

```
yarn warlock <command>
```

Command warlock dapat dilihat di [sini](#command)

#### As global dependency

Pastikan Warlock telah di build, lalu install warlock secara global dengan perintah berikut:

```
npm install -g .
```

Mengingat warlock di install secara global maka kita dapat menjalankan warlock melalui global binary. Jalankan Warlock dengan perintah berikut:

```
warlock <command>
```

Command warlock dapat dilihat di [sini](#command)
