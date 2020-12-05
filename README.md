Extension that measures and accumulates page load time for hosts using the Web Timing API.

Can be used to determine how much time is spent waiting for pages on sites to be loaded
which can help to drive page load optimizations.

Copyright 2020 Chris Morgan <chmorgan@gmail.com>

Total time is split into a few different parts, network time, server time, client time and total time.

"Network time is connectEnd minus navigationStart. Server time is responseEnd minus connectEnd. Finally, client time is loadEventEnd minus responseEnd."
(as described by <a href="https://chrome.google.com/webstore/detail/simple-performance-bar/gkicgocakpcjjdeigifekmfmpcpepakk">'simple-performance-bar'</a>)

Icon from Sumana Chamrunworakiat, TH, https://thenounproject.com/search/?q=sigma&i=659837

Based on https://github.com/alex-vv/chrome-load-timer (https://chrome.google.com/webstore/detail/page-load-time/fploionmjgeclbkemipmkogoaohcdbig?hl=en)

Close icon from:
<div>Icons made by <a href="http://www.flaticon.com/authors/pixel-buddha" title="Pixel Buddha">Pixel Buddha</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>

# License
This project is licensed under the terms of the GPLv3
