// ContentFactory.js
function ContentFactory()
{
	this.pInstance = null;
}

ContentFactory.renderPageShell = function() {
	try {
		var template = TemplateManager.getInstance().getTemplate("utility_error");
		return template;
	}
	catch (err) {
	    console.error("ERROR - ContentFactory.renderPageShell() - Unable to render content: " + err.message);
		return '<div class="error">Unable to load</div>';
	}
};

// Create a package data structure to hold a class definition.
ContentFactory.assignToPackage = function(targetPackage, classRef) {
	try {
		var packagePath = targetPackage.split(".");
		var packageHandle = window;
		if (packagePath.length > 1) {
			for (var i = 0; i < packagePath.length-1; i++) {
				if (typeof(packageHandle[packagePath[i]]) == "undefined") {
					packageHandle[packagePath[i]] = {};
				}
				packageHandle = packageHandle[packagePath[i]];
			}
			packageHandle[packagePath[packagePath.length-1]] = classRef;
		}
	}
	catch (err) {
		console.error("ERROR - ContentFactory.assignToPackage() - Can not assign class to package: " + err.message);
	}
}    
