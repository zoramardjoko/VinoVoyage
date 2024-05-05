const { expect } = require('@jest/globals');
const supertest = require('supertest');
const app = require('../index');
const results = require("./results.json")

test('GET /random', async () => {
  await supertest(app).get('/random')
    .expect(200)
    .then((res) => {
      expect(res.body).toStrictEqual({
        winery: expect.any(String),
        title: expect.any(String),
      });
    });
});

test('GET /wine/Black Stallion 2013 Limited Release Merlot (Napa Valley)', async () => {
  await supertest(app).get('/wine/Black Stallion 2013 Limited Release Merlot (Napa Valley)')
    .expect(200)
    .then((res) => {
      expect(res.body.winery).toMatch(/^Black Stallion$/)
    });
});

test('GET /wine/randomwordnotindata', async () => {
  await supertest(app).get('/wine/randomwordnotindata')
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({})
    });
});

test('GET /sommeliers', async () => {
  const expectedLength = 19;
  await supertest(app).get('/sommeliers')
    .expect(200)
    .then((res) => {
      expect(res.body.length).toBe(expectedLength)
    });
});

test('GET /top_wines top 12', async () => {
  await supertest(app).get('/top_wines')
    .expect(200)
    .then((res) => {
      expect(res.body.length).toEqual(12);
      expect(res.body[0].variety).toMatch(/^Sangiovese$/);
    });
});

test('GET /top_wines with pages', async () => {
  await supertest(app).get('/top_wines?page=1&?page_size=10')
    .expect(200)
    .then((res) => {
      expect(res.body.length).toEqual(10);
      // expect(res.body[0].variety).toMatch(/^Sangiovese$/);
    });
});

test('GET /top_wines with pages error', async () => {
  await supertest(app).get('/top_wines?page=1&page_size=0')
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({});
      // expect(res.body[0].variety).toMatch(/^Sangiovese$/);
    });
});


test('GET /search_wines one result', async () => {
  await supertest(app).get('/search_wines?title=2013%20purple%20paradise')
    .expect(200)
    .then((res) => {
      console.log(res.body);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].winery).toMatch(/^Chronic Cellars$/);
    });
});

test('GET /search_wines no results', async () => {
  await supertest(app).get('/search_wines?title=2013%20purple%20paradise?price_lower_bound=100')
    .expect(200)
    .then((res) => {
      console.log(res.body);
      expect(res.body.length).toEqual(0);
      expect(res.body).toEqual([]);
    });
});


test('GET /question_one', async () => {
  await supertest(app).get('/question_one')
    .expect(200)
    .then((res) => {
      console.log(res.body);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].title.trim()).toMatch(/^100 Percent Wine 2012 All Profits to Charity Red \(California\)$/);
    });
});

test('GET /question_two', async () => {
  await supertest(app).get('/question_two')
    .expect(200)
    .then((res) => {
      expect(res.body[0].title).toMatch(/^:Nota Bene 2005 Una Notte Red \(Washington\)$/);
    });
});

test('GET /question_three', async () => {
  await supertest(app).get('/question_three')
    .expect(200)
    .then((res) => {
      expect(typeof res.body[0].average_points).toBe('number');
    });
});

