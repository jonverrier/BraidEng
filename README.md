# Braid Engine

## Table of Contents
* [General information](#general-information)
* [Technologies](#technologies)
* [Licence](#licence)

## General Information
The Braid Engine is an AI-enabled Learning Management System (LMS). The objective is to be able to build a curriculum of content by processing open-source documents from the web (YouTube videos, GitHub repositories, and plan HTML text) and loading AI generated summaries into a document store. A simple front end then enables students to navigate through the content, can answer questions based on the embedded content, and recommend next steps once the student is familiar with a certain level of content. 

The specific domain is to teach students how to build AI applications using modern Large Language Model (LLM) technology, and the current approaches to this - Retrieval Assisted Generation (RAG), and multi-sept workflows using the LLM to generate summaries and process questions.

The benefits of this approach are:
- It is simple to maintain content, given that the field is moving so rapidly. Traditional approaches of generating bespoke new content are often obsolete by the time they are ready. 
- Students get a flavour of what is possible with modern AI by using the tools. 

## Technologies
The front end is written in Typescript, using the Microsoft Fluent UI framework: https://react.fluentui.dev/.

The messaging code uses the Microsoft Fluent Framework: [Fluid Framework Documentation](https://fluidframework.com/docs/).

There is a simple set of Node.js APIs, written to run on the Azure stack. The engine currently uses GPT-3.5, and the document database is created by hand-cranked Python code. 

Tests are written in Mocha: [Mocha - the fun, simple, flexible JavaScript test framework (mochajs.org)](https://mochajs.org/).

Scripts to build the RAG database are written in Python, using Beautiful Soup for web scraping. https://www.python.org/, https://beautiful-soup-4.readthedocs.io/.

The key directories are:
-	core – most code is here, written in plan typescript. Core has no external dependencies. 
-	UI – REACT UI code – written in typescript /tsx.  UI depends on core. 
-	test – test code.  Test depends on core. 
-   scripts - python code to download  build the document database. 
-   data - the document database is generated into here. 

By design, the app builds to a single .JS file using webpack. The JS file is then included in the production website where the app is hosted. This is currently another repo, ‘BraidWeb’. 

## Licence
GNU AFFERO GENERAL PUBLIC LICENSE.

This is intentionally a restrictive licence. The source is effectively available for non-commercial use (subject to the licence terms as listed, which enable use for learning, self study etc). Commercial use either must abide by the licence terms, which are strong, or a separate licence that enables more normal commercial use & distribution is available from Braid. Contact us for more details malto:info@braidtechnologies.io. 
