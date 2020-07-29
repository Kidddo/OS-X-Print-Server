#Deprecated

##Kidddo Print Server OS X
This guide will help you set up a [Kidddo](http://kidddo.com) Print Server on OS X. Here's our checklist of what we will accomplish:

* Install Printer Drivers
* Turn on the Mac's web interface for its CUPS server
* Add Printer(s) to CUPS admin page
* Install Node.js and required Modules
* Configure PrintServer.js
* Run PrintServer.js
* Run without Terminal
* Auto-Run at System Startup

===
###Install Printer Drivers
For the purpose of this tutorial we will be installing a DYMO Labelwriter printer. (If you're using a different printer - you should be able to find driver downloads on their manufacture's website)

Download Printer Drivers from [DYMO](https://dymo.custhelp.com/app/answers/detail/a_id/101):
[DLS8Setup.8.5.0.dmg](http://download.dymo.com/Software/Mac/DLS8Setup.8.5.0.dmg)

Install downloaded package using it's installer.

===
###Turn on the Mac's web interface for it's CUPS server

Your CUPS server resides at [http://127.0.0.1:631](http://127.0.0.1:631). Visit that link in your browser - if the Web Interface does not appear - you will need to enable it:

Open Terminal (this application is found in the Applications/Utilities folder)

Type or paste the following command into your Terminal prompt and hit return:

    sudo cupsctl WebInterface=yes

Now the Web Interface should appear when you refresh your browser page.

===
###Add Printer(s) to CUPS admin page
In the Web Interface, click on the [Administrative](http://127.0.0.1:631/admin) tab and then click on "Add Printer". Select your connected label printer from the "Local Printers" list and click "Continue".

The Description is what will be referred to as your printer "name" in your Kidddo account. Name it something easily identifiable such as "dymo1". Add a location if you'd like (not necessary) and click "Continue".

Select the correct Driver for your printer model and click "Continue".

You should now be able to access your printer settings through: [http://127.0.0.1:631/printers/dymo1](http://127.0.0.1:631/printers/dymo1) (subsitute "dymo1" for your printer name).

If you'd like you can print a test page by selecting "Print Test Page" from the "Maintenance" drop down to make sure everything is working correctly so far.

===
###Install Node.js
Node.js is a platform built on Chrome's JavaScript runtime for easily building fast, scalable network applications. Our print server will run on this platform.

Download and install the free package from [nodejs.org](http://nodejs.org).

A Node.js module manager called NPM will be installed automatically and this is what we will use to install the required modules for our server.

Open Terminal back up and type or paste the following command and hit return:

    npm install ipp pdfkit ibtrealtimesjnode

This will install the following modules:

* [ipp](https://npmjs.org/package/ipp) (for printing to our CUPS server)
* [pdfkit](https://npmjs.org/package/pdfkit) (for generating labels)
* [ibtrealtimesjnode](https://npmjs.org/package/ibtrealtimesjnode) (for our realtime communication)

The install process may take a few moments. If there are any errors you will want to repeat the process.

===
###Configure PrintServer.js

Open PrintServer.js in "Text Edit" your favorite plain-text editor.

We're going to focus on 1 line near the top of the script: 

    var token = 'abc';

Replace `abc` with your organization's API token. Your token can be found in your Kidddo [Admin](https://kidddo.com/admin#settings) page under "Settings>Set Printer>Server".

===
###Run PrintServer.js

In Terminal type `node` followed by a space and the path to where PrintServer.js is saved and hit return:

    node PrintServer.js

**TIP:** Terminal will auto-fill the path at the cursor if you drop the file on it's window.

===
###Run without Terminal

Now that we're up and running, say you'd like to be able to Run or Auto-Run PrintServer.js without having to open Terminal or use the command-line every time...

We can use another built-in tool in OS X called [Automator](http://www.macosxautomation.com/automator/) to create an app that will run a shell script for us.

#####Make PrintServer.js Executable

In Terminal, type (substituing "PrintServer.js" with the full path to your copy of PrintServer.js):

    chmod +x PrintServer.js

#####Automator

Open Automator (in your Applications folder) create a new document (File->New) and select "Application" as the document type.

In the search field, search for the action, "Run Shell Script" and drag it to the drop zone on the workflow area (right-side). The "Run Shell Script Action" should appear with `Shell: /bin/bash` and `Pass input: to stdin` - if not, change them to be so.

In the action window, type or paste the following:

    PATH=$PATH:~/:/usr/local/bin PrintServer.js

If PrintServer.js is not in `usr/local/bin` (the home folder of your user acccount) then substitute the appropriate directory.

Save your new application (File->Save), choose a location and name for the app (eg. PrintServer Launcher) and hit "Save". Now you can double-click the app icon to run PrintServer.js like you would any other app. A spinning gear should display in your menu bar - where you can also stop the script from running.

===
###Auto-Run at System Startup

Now that you've come this far, why not have PrintServer automatically run when OS X starts up? In case you don't already know how to set this up:

Open System Preferences.

Click Users/Groups.

Select a User and Click the "Login Items" tab.

Click the "+" to add a new app.

Navigate to your PrintServer Launcher app and click "Add".
