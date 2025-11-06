---
title: 'REST API Testing with ScalaTest - Matchers'
date: 2024-04-02T21:00:00+02:00
author: Krzysztof Komorowski
tags: [Testing, Scala, BDD, Tutorial]
image: https://images.unsplash.com/photo-1622227920933-7fcd7377703f?q=80&w=1000&h=500&fit=crop
draft: false
type: post
---

In the [previous post]({{< ref "/posts/automated-acceptance-tests-with-scalatest/" >}})
I've described how to start with test automation of the REST API using ScalaTest.
Today I would like to show some more examples of using ScalaTest matchers - a smart
way of writing more readable assertions.

## String matchers

Let's get back for a while to our 
[previous code example]({{< ref "/posts/automated-acceptance-tests-with-scalatest/#example-send-request" >}}). 
Our test seems still a bit unfinished as we have no assertions on the response body.
ScalaTest has few methods defined called matchers which will give us nice looking assertions
on the different data types.

### startWith, endWith, include

First, we'll check simple assertions working on Strings:

The response body must contain the blog name:

```scala
response.body must include("https://hiquality.dev")
```

The body must also start and end with braces:

```scala
response.body must startWith("{")
response.body must endWith("}")
```

### Regular expressions

We can also check if the response body matches a regular expression:

```scala
response.body must fullyMatch regex """.*"blog":"(https://)?hiquality\.dev".*"""
```

## Parsing a response to JSON

Checking the response body as string might be a bit too verbose. 
Of course there is a better way to do it: we'll parse the response body to a Scala object.

In this example I've chosen [Circe]("https://circe.github.io/circe/") - 
one of the most popular JSON libraries for Scala.

Let's add some dependencies to `build.sbt`:

```scala
val circeVersion = "0.14.6"
libraryDependencies += "io.circe" %% "circe-core" % circeVersion
libraryDependencies += "io.circe" %% "circe-generic" % circeVersion
libraryDependencies += "io.circe" %% "circe-parser" % circeVersion
```

We'll use also sttp's Circe integration:

```scala
libraryDependencies += "com.softwaremill.sttp.client3" %% "circe" % "3.9.3"
```

First we'll define a `GitHubUserProfile` case class:

```scala
case class GitHubUserProfile(
    login: String,
    id: Int,
    name: String,
    company: Option[String],
    blog: String
)
```

and pass it as a type parameter to the decoder in the request definition:

```scala
val request = quickRequest
    .get(uri"https://api.github.com/users/kkomorowski")
    .response(asJson[GitHubUserProfile])
```

In the previous example the response body had type `String`.
This time it is different and - the client returns 
`Either[ResponseException[String, circe.Error], GitHubUserProfile]`.
If parsing the response body fails, we'll get an exception on the 
left side of the `Either`, otherwise we'll get the parsed object on the right side.

We can now check if the response was successful and safely extract the value from the `Either`
and assert on the fields of the object:

```scala
response.body.isRight must be(true)
val user = response.body.toOption.get
user.blog must be("https://hiquality.dev")
```

The problem with this code snippet is when the first assertion fails, we'll get quite
unpleasant error on the logs:

```text
false was not equal to true
ScalaTestFailureLocation: GitHubUserSpec at (GitHubUserSpec.scala:49)
Expected :true
Actual   :false
```

Except for the file and line number in the stack trace this gives not much
clue what was the reason for failure. If we skip the assertion here, we could
end up in even more cumbersome `NoSuchElementException`. 

## EitherValues trait

Fortunately ScalaTest provides a handy `EitherValues` trait that makes 
it easier to work with `Either` values.

Let's import it and use it in our test:

```scala
import org.scalatest.EitherValues
```

and mix-in it by extending our test class.

We can now write our previous assertion the following way:

```scala
val user = response.body.value
user.blog must be("https://hiquality.dev")
```

The `value` implicit conversion is used to extract the value 
from the `Either` and to assert on it.

We can also assert on the left side of the `Either` if the parsing of the response body fails:

```scala
response.body.left.value mustBe a [ResponseException[_, _]]
```

In the example above we've asserted not on the value but on the type of the left side of the `Either`.

Similar traits as `EitherValues` exist for `Option` and `Try` types.

## Matcher negations

We can also easily negate the matcher by using a `not` word in our matcher.

```scala
user.blog must not be empty
```

## Conclusion

In this blog post we've learned how to parse an HTTP response body to
Scala case class using Circe. We've tried different ways of writing 
the assertions in the test and have more readable error messages
for the failed assertions thanks to `EitherValue` trait provided by
ScalaTest.

Thanks for reading this article and see you in the next episode
of ScalaTest series.
