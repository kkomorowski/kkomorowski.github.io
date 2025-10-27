---
title: 'Automated Acceptance Tests with ScalaTest'
date: 2024-02-20T19:45:00+01:00
author: Krzysztof Komorowski
tags: [Testing, Scala, Functional, BDD, Tutorial]
image: cover.jpg
draft: false
---

Almost seven years ago I've started a new and unexpected journey. Back then
I had some experience with test automation in Python and Java and I've joined 
the team working on the backend application written in Scala. It was my first
experience with functional programming so I was wondering if
it would not be hard to learn and maintain the test suite written in this
new for me language. It turned out that it's not and the work with Scala
gave me a lot of fun.

In this first episode of the blog post series I would like to show how 
to start testing a REST API using ScalaTest and how to use some more 
advanced features of this one of the most popular Scala-based test frameworks.

<!--more-->

## Setting up ScalaTest test project.

Scala is a JVM based language so we will need to have JDK installed (I usually use
the latest LTS release -- 21 at the time of writing this article).

We would also use [SBT](https://www.scala-sbt.org/) -- the most popular build tools 
for Scala projects.

After installing both we can start a new ScalaTest project from scratch
using following in your command line:

`sbt new scala/scalatest-example.g8` [^1]

You can also clone the GitHub repository with the code presented
in this article: https://github.com/kkomorowski/scalatest-getting-started

## Some Gherkin, please!

The clue of the Behavior-Driven Development are the well defined test
scenarios that might be used as the documentation of the system. ScalaTest
is a very versatile test framework that gives the possibility of
choosing the test style that best suites your needs.

In the example we'll use `FeatureSpec` and `GivenWhenThen` from ScalaTest
to describe the scenarios of our tested feature using Gherkin-like DSL:

```scala
class GitHubUserSpec extends AnyFeatureSpec with GivenWhenThen:

  Feature("GitHub User Profile"):

    info("As a programmer")
    info("I want to check the user profile presence")
    info("So I know if I can create an account with a given name")

    Scenario("GitHub User Exists"):
      Given("a GitHub account exists")
      When("I send a request to the /user/{username} API endpoint")
      Then("I get the response with HTTP status code 200")
```

NOTE: The examples use the Scala 3 
[significant indentation](https://docs.scala-lang.org/scala3/reference/other-new-features/indentation.html).
This way of writing of ScalaTest scenarios even more resembles Cucumber `feature` files to me.

## Let's make a request!

Unlike Cucumber or JBehave our `Given When Then` steps are purely informational
and does not bring any implementation of the test behind. We need to implement
the test code ourself.

Let's try to make a first request. Scala is highly compatible with Java 
so we could use one of the well known API testing libraries like RestAssured but here I would like to 
show you [sttp](https://sttp.softwaremill.com/en/stable/) -- a Scala-based library that 
will send the HTTP request for us.

Simply add this line to your `build.sbt` project file:

```scala
libraryDependencies += "com.softwaremill.sttp.client3" %% "core" % "3.9.3"
```

and import to easily use Java HTTP client from Scala code:

```scala
import sttp.client3.quick.*
```

Now we can fill up our scenario with the code:
{id=example-send-request}

```scala
Scenario("GitHub User Exists"):
  Given("a GitHub account exists")
  val username = "kkomorowski"
  When("I send a request to the /user/{username} API endpoint")
  val request = quickRequest.get(uri"https://api.github.com/users/$username")
  val response = simpleHttpClient.send(request)
  Then("I get the response with HTTP status code 200")
```

## ... and assert on the response.

The only thing left is to assert on the response from the API.
We can use ScalaTest matchers to have the code more readable:

Add `org.scalatest.matchers.must.Matchers` to the imports and extend your
test class with `Matchers` trait. Now we can write the assertion
the following way:

```scala
  response.code mustBe StatusCode(200)
```

## Running your first tests

The test is ready to be run. You can run it easily from the IDE (IntelliJ IDEA 
is able to do it when equipped with Scala plugin. VSCode needs Metals extension).

To run the tests from the command line we can use `sbt`, just write:
```
sbt test
```
in your command line.

After few lines of the logs from the build stage you should see a simple
text base test report similar to this one:

```markdown
[info] GitHubUserSpec:
[info] Feature: GitHub User Profile
[info]   As a programmer 
[info]   I want to check the user profile presence 
[info]   So I know if I can create an account with a given name 
[info]   Scenario: GitHub User Exists
[info]     Given a GitHub account exists 
[info]     When I send a request to the /user/{username} API endpoint 
[info]     Then I get the response with HTTP status code 200
[info] Run completed in 1 second, 811 milliseconds.
[info] Total number of tests run: 1
[info] Suites: completed 1, aborted 0
[info] Tests: succeeded 1, failed 0, canceled 0, ignored 0, pending 0
[info] All tests passed.
```

## End words

In this article we've written our acceptance tests of the REST API using ScalaTest. 
Using `FeatureSpec` and `GivenWhenThen` trait we've been able describe
the test scenarios and add the logic code of the test using STTP library
to make the HTTP request and add a simple assertion on the result. 

I hope that this short guide gave you an inspiration to try ScalaTest
in your testing project and convinced you that it might not be that
hard to learn.


[^1]: You can find an official guide on the Scala Language website: 
      https://docs.scala-lang.org/getting-started/sbt-track/testing-scala-with-sbt-on-the-command-line.html.