# Recovery Experience Questionnaire web assessment

A static, accessible HTML/CSS/JavaScript implementation of the 16-item Recovery Experience Questionnaire (REQ). It calculates the four subscale means, displays a descriptive overall average, and stores progress and results in the visitor's browser using `localStorage`.

## Files

* `index.html` - page structure, instructions, attribution, and results container
* `styles.css` - responsive and print styles
* `app.js` - questions, validation, scoring, rendering, and local storage

## Scoring

Each subscale is the unweighted mean of four items:

* Items 1–4: Psychological detachment
* Items 5–8: Relaxation
* Items 9–12: Mastery
* Items 13–16: Control

## Local data

Data is stored under the browser key `req-assessment-v1`. It does not leave the browser. Clearing site data, using the app's **Clear local data** button, or using a private-browsing session can remove it. Because storage is device- and browser-specific, results do not synchronize across devices.

## Attribution

Sonnentag, S., \& Fritz, C. (2007). The Recovery Experience Questionnaire: Development and validation of a measure for assessing recuperation and unwinding from work. *Journal of Occupational Health Psychology, 12*(3), 204–221. https://doi.org/10.1037/1076-8998.12.3.204