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
        .withBody("{\"greeting\": \"Hello, WireMock!\"}")));
```

Here I created a stub that for a `GET` request on the relative URL matching exactly `/hello/wiremock` will return a `200` response that will have `Content-Type` header `application-json` and the body containing a greeting.

### Stubbing different HTTP methods

### Could I prepare a stub that cover all HTTP method?

### Matching on URL with regular expressions

## Matching on request body and headers

### Multiple logical conditions

## Summary