# Braid Engine

## Table of Contents

- [General Information](#general-information)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [License](#license)

## General Information

The Braid Engine is an AI-enabled Learning Management System (LMS). The objective is to be able to build a curriculum of content by processing open-source documents from the web (YouTube videos, GitHub repositories, and plan HTML text) and loading AI generated summaries into a document store. A simple front end then enables students to ask questions which the model can answer based on the embedded content. The model can also make suggestions based on content the students have interacted with.

The specific domain is to teach students how to build AI applications using modern Large Language Model (LLM) technology, and the current approaches to this - Retrieval Assisted Generation (RAG), and multi-step workflows using the LLM to generate summaries and process questions.

The benefits of this approach are:

- It is simple to maintain content, given that the field is moving so rapidly. Traditional approaches of generating bespoke new content are often obsolete by the time they are ready.
- Students get a flavour of what is possible with modern AI by using the tools.

### Benefits

- **Ease of Content Maintenance:** The system adapts to rapidly evolving AI fields by processing and summarizing current content.
- **Hands-on AI Experience:** Students explore AI capabilities firsthand through interactive tools.

## Technologies

The front end is written in Typescript, using the Microsoft Fluent UI framework: https://react.fluentui.dev/.

The messaging code uses the Microsoft Fluent Framework: [Fluid Framework Documentation](https://fluidframework.com/docs/).

There is a simple set of Node.js APIs, written to run on the Azure stack. The engine currently uses GPT-3.5, and the document database is created by hand-cranked Python code.

Tests are written in Mocha: [Mocha - the fun, simple, flexible JavaScript test framework (mochajs.org)](https://mochajs.org/).

Scripts to build the RAG database are written in Python, using Beautiful Soup for web scraping. https://www.python.org/, https://beautiful-soup-4.readthedocs.io/.

- **Frontend:** TypeScript, Microsoft Fluent UI framework ([React Fluent UI](https://react.fluentui.dev/))
- **Messaging:** Microsoft Fluent Framework ([Fluid Framework Documentation](https://fluidframework.com/docs/))
- **Backend APIs:** Node.js APIs on Azure stack
- **AI Model:** GPT-3.5
- **Document Database:** Python with custom scripts
- **Testing:** Mocha ([Mocha Documentation](https://mochajs.org/))
- **Web Scraping:** Python, Beautiful Soup ([Python](https://www.python.org/), [Beautiful Soup Documentation](https://beautiful-soup-4.readthedocs.io/))

The key directories are:

- core – most code is here, written in plan typescript. Core has no external dependencies.
- UI – REACT UI code – written in typescript /tsx. UI depends on core.
- test – test code. Test depends on core.
- scripts - python code to download build the document database.
- data - the document database is generated into here.

By design, the app builds to a single .JS file using webpack. The JS file is then included in the production website where the app is hosted. This is currently another repo, ‘BraidWeb’.

## Installation

1. Navigate to the desired directory:

1. **Clone the repository:**

   - On GitHub.com, navigate to the main page of the repository.

   - Above the list of files, click Code.

   - Copy the URL for the repository.

     -To clone the repository using HTTPS, under "HTTPS", click .

   - Open Git Bash.

   - Change the current working directory to the location where you want the cloned directory.

   - Type git clone, and then paste the URL you copied earlier.

     -git clone git clone https://github.com/jonverrier/BraidEng.git

   -Press Enter to create your local clone.

1. **Set up virtual enviornment:**
   python -m venv venv
   `venv\Scripts\activate` # On Windows use
   source venv/bin/activate #On MacOS/Linuix

1. **Install dependecies:**
   pip install -r scripts/requirements.txt

## Licence

GNU AFFERO GENERAL PUBLIC LICENSE.

This is intentionally a restrictive licence. The source is effectively available for non-commercial use (subject to the licence terms as listed, which enable use for learning, self study etc). Commercial use either must abide by the licence terms, which are strong, or a separate licence that enables more normal commercial use & distribution is available from Braid. Contact us for more details mailto:info@braidtechnologies.io.

# Braid Engine

## Table of Contents

- [General Information](#general-information)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [License](#license)

## General Information

The Braid Engine is an AI-enabled Learning Management System (LMS) designed to build a curriculum using open-source documents from the web (YouTube videos, GitHub repositories, and plain HTML text). It processes these documents to load AI-generated summaries into a document store. A simple frontend allows students to ask questions, which the model can answer based on embedded content. The model also provides suggestions based on student interactions.

The specific domain focuses on teaching students how to build AI applications using modern Large Language Model (LLM) technology, particularly Retrieval-Assisted Generation (RAG) and multi-step workflows for generating summaries and answering questions.

## Technologies

- **Frontend:** TypeScript, Microsoft Fluent UI framework ([React Fluent UI](https://react.fluentui.dev/))
- **Messaging:** Microsoft Fluent Framework ([Fluid Framework Documentation](https://fluidframework.com/docs/))
- **Backend APIs:** Node.js APIs on Azure stack
- **AI Model:** GPT-3.5
- **Document Database:** Python with custom scripts
- **Testing:** Mocha ([Mocha Documentation](https://mochajs.org/))
- **Web Scraping:** Python, Beautiful Soup ([Python](https://www.python.org/), [Beautiful Soup Documentation](https://beautiful-soup-4.readthedocs.io/))

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your_username/your_project.git
   cd your_project
   ```
