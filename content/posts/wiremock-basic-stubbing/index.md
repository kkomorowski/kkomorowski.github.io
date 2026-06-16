---
title: "WireMock: Basic Stubbing"
date: "2026-05-28T22:27:34+02:00"
tags:
  - Testing
  - Java
  - WireMock
author: "Krzysztof Komorowski"
draft: false
type: "post"
params:
  wiremock-getting-started: "/posts/getting-started-with-wiremock/"
---

In the [previous post]({{% param "wiremock-getting-started" %}}), I described how to start with WireMock. Today I would like to show you how to use WireMock to create more robust stubs and test faults and errors.

## What are stubs?

A stub is a definition of the response that WireMock will return when the request from the software under test will match defined conditions. Let's look at the basic example:

```java
stubFor(get("/hello"));
```

I've defined here just the HTTP method and URL -- the WireMock will return a `200` response without a body in this case.

If the URL will not be mached WireMock returns `404` response.

If you are a fan of BDD style you can use `givenThat` method in place of `stubFor`.

<!--more-->

## Basic stub definition

Usually I need more in my tests than stubbing a simple OK response. To configure an exact status code, response body and content type I can use following pattern:

```java
givenThat(
  get(urlEqualTo("/hello/wiremock"))
    .willReturn(
      aResponse()
        .withHeader("Content-Type", "application/json")
        .withStatus(200)
        .withBody("{\"greeting\": \"Hello, WireMock!\"}")
    )
);
```

Here I created a stub that for a `GET` request on the relative URL matching exactly `/hello/wiremock` will return a `200` response that will have `Content-Type` header `application-json` and the body containing a greeting.

`urlEqualTo` URL pattern matches full path with the query parameters. To match only on the path I would use `urlPathEqualTo` method as in this example:

```java
@Test
public void getHelloTest() {
  stubFor(
    get(urlPathEqualTo("/hello"))
      .willReturn(ok())
  );

  given()
    .baseUri("http://localhost:8080")
  .when()
    .get("/hello?who=wiremock")
  .then()
    .assertThat().statusCode(200);
}
```

A basic stub
```java
stubFor(get("/hello"));
```
is an equivalent of
```java
stubFor(urlEqualTo("/hello"));
```
so the query parameters should be specified here as well if needed.

### Stubbing different HTTP methods

The same way as for the `GET` request I can prepare stubs for other HTTP methods like `POST`, `PUT`, `DELETE`, etc.

Let's look at the example of the stub for the `POST` request:

```java
givenThat(
  post("/order")
    .willReturn(
      aResponse()
        .withStatus(201)
        .withBody("{\"order_id\":\"b378ba3d-5c2d-43cc-9d21-e8a3cfe0be0c\"}")
    )
);
```

### Could I prepare a stub that cover all HTTP method?

WireMock implements a special `MappingBuilder` that will match any HTTP method. Let's look at following test:

```java
@Test
public void helloAnyMethod() {
  stubFor(
    any(urlEqualTo("/hello"))
      .willReturn(ok())
  );

  given()
    .baseUri("http://localhost:8080")
  .when()
    .delete("/hello")
  .then()
    .assertThat().statusCode(200);
}
```

This stub is most useful when I would like to set some default API behaviour different than the ususal `404` response.

### Matching on URL with regular expressions

Match on the URL does not need to be exact. Both matches - for URL and path - have their regular expression counterparts.

To match with the regex I can use following stub:

```java
stubFor(
  get(urlPathEqualTo("/hello/([a-z]*)"))
    .willReturn(ok())
);
```

### Matching on path parameters

WireMock supports matching on the path parameters as well.

```java
stubFor(
  get(urlPathTemplate("/hello/{name}"))
    .withPathParam("name", equalTo("wiremock"))
    .willReturn(ok("Hello, WireMock!"))
);
```

## Matching on request body and headers

### Multiple logical conditions

## Summary

## References

1. Stubbing | WireMock - https://wiremock.org/docs/stubbing/
