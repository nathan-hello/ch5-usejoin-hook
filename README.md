# ch5-usejoin-hook
This is not an exhaustive template. Just a React hook for publishing to and subscribing from your Crestron controller over join numbers.

I have not personally tested it for anything other than digital (boolean) joins, so please make an issue if you find something. I did notice that using this to try to manipulate state outside of the processor (for example sending a high digital signal until some other signal is of a value) does not work well. Either use the JS for 100% of the logic and publish the result, or let the processor do the bulk of the work, don't try to do both.

This was used in a React SPA built with Vite. You can see that I use pepperdash's fork of CH5 because I couldn't get the Crestron library working in my project, likely because their package.json is a bit of a mess. If there is a fix to this, again, please make an issue. 

I imagine that Reserve Joins can be passed in to here without issue from the CrComLib library, but I haven't tried that.
