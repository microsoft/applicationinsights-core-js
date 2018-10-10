[![Build Status](https://travis-ci.org/Microsoft/applicationinsights-core-js.svg?branch=master)](https://travis-ci.org/Microsoft/applicationinsights-core-js)
[![Build status](https://dev.azure.com/mseng/AppInsights/_apis/build/status/AppInsights%20-%20DevTools/1DS%20JavaScript%20SDK%20-%20Core)](https://dev.azure.com/mseng/AppInsights/_build/latest?definitionId=7605)

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.


To build:
npm install
amd> grunt core
cjs> grunt corecjs

To run unit tests:
grunt coretest

To publish a new npm package (publish cjs first then amd)
cjs>
     grunt corecjs  
     Please ensure unit tests pass  
   cd cjs  
    update version in package.json (version number even for cjs)  
   npm pack  
   npm publish --tag cjs

amd> 
     grunt core  
     Please ensure unit tests pass  
   cd amd  
    update version in package.json (version number odd for amd)  
   npm pack  
   npm publish --tag amd  

To publish a new nuget package, follow the steps below:
1. Go to VSTS Packages (https://mseng.visualstudio.com/AppInsights/\_packaging?feed=ApplicationInsights-Team&\_a=feed) 
2. Click "connect to feed". Select NuGet.
3. Follow the instructions for installing the tools and adding the feed.
4. Follow the instructions below to push cjs and amd nuget packages. (publish cjs first then amd)

cjs>
     grunt corecjs  
     Please ensure unit tests pass  
   cd cjs
    update version in applicationinsights-core-js.nuspec (version number even for cjs)  
   nuget pack
   nuget.exe push -Source "ApplicationInsights-Team" -ApiKey VSTS <Nuget Package Name>.nupkg
   
amd> 
     grunt core  
     Please ensure unit tests pass  
   cd amd  
    update version in applicationinsights-core-js.nuspec (version number odd for amd)  
   nuget pack
   nuget.exe push -Source "ApplicationInsights-Team" -ApiKey VSTS <Nuget Package Name>.nupkg