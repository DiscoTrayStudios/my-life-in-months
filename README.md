# My Life in Months

Inspired by [Isabella Benabaye](https://github.com/isabellabenabaye/life-chart),
[Sharla Gelfand](https://github.com/sharlagelfand/mylifeinmonths), and
[Tim Urban](https://waitbutwhy.com/2014/05/life-weeks.html),
**My Life in Months** is a d3 JavaScript implementation of a
chart that can help you see the larger picture of your life.
You can use it to map out where you've lived, your
career path, or other meaningful life events.

# Example Chart

![MLIM](assets/images/random.png)

# Easy Code Snippet

```
var data = [
  {"name": "Paris", "value": 57},
  {"name": "Warren", "value": 48},
  {"name": "Charleston", "value": 98},
  {"name": "Conway", "value": 24}
]

var chart = myLifeInMonths();

d3.select("#container")
    .datum(data)
    .call(chart);
```

# Live Website

Try it out at https://discotraystudios.github.io/my-life-in-months/

# Credits

* [d3-waffle](https://github.com/jbkunst/d3-waffle/)
* [randomColor](https://github.com/davidmerfield/randomColor)
* [dom-to-image](https://github.com/tsayen/dom-to-image)
* [editable-table](https://mindmup.github.io/editable-table/)
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
