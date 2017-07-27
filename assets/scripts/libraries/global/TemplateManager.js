 // TemplateManager.js
function TemplateManager()
{
	this.pInstance = null;
	this.pTemplates = {};
}

TemplateManager.getInstance = function ()
{
	if (!this.pInstance)
	{
		this.pInstance = new TemplateManager();
	}
	return this.pInstance;
};

TemplateManager.prototype.init = function () {
};

TemplateManager.prototype.requestTemplates = function(templateArray, callback) {
	
	var parent = this;
	var loadQueue = [];
	var numLoaded = 0;
	var i, n;
	
	try {
		for (i = 0, n = templateArray.length; i < n; i++) {
			if (typeof(this.pTemplates[templateArray[i]]) == "undefined") {
				loadQueue.push(templateArray[i]);
			}
		}
		console.log("loadQueue.length === " + loadQueue.length);
		if (loadQueue.length > 0) {
			
			for (i = 0, n = loadQueue.length; i < n; i++) {
				$.ajax({
					url: '/templates/' + loadQueue[i].split("_").join("/") + '.html',
					templateID: loadQueue[i],
					success: function (html) {
						//	console.log(this.templateID + html);
						parent.pTemplates[this.templateID] = html;
						numLoaded++;
						if (numLoaded == loadQueue.length) {
							console.log("loadQueue.length === DONE " + loadQueue.length);
							if (typeof(callback) == "function") {
								callback(parent.pTemplates);
							}
						}
					},
					error: function() {
						numLoaded++;
						if (numLoaded == loadQueue.length) {
							console.log("loadQueue.length === DONE " + loadQueue.length);
							if (typeof(callback) == "function") {
								callback(parent.pTemplates);
								
							}
						}
						console.error("ERROR - TemplateManager.requestTemplates() - The attempt to load template " + this.templateID + " from the network failed.");
					}
				});
			}
		}
		else {
			if (typeof(callback) == "function") {
				callback(this.pTemplates);
			}
		}
	}
	catch (err) {
		console.error("ERROR - TemplateManager.requestTemplates() - Unable to retrieve templates " + templateArray + ": " + err.message);
	}
};

TemplateManager.prototype.updateTemplate = function (template, properties) {
	try {
		var n = properties.length;
		var currentProperty;
		if (template == null) {
			console.error("ERROR - TemplateManager.updateTemplate() - Null template data.");
			return "";
		}
		else {
			for (var property in properties) {
				template = template.split("$" + property + "$").join(properties[property]);
			}
			return template;	
		}
	}
	catch(err) {
		console.error("ERROR - TemplateManager.updateTemplate() - Unable to update template: " + err.message);
		return "";
	}
}

TemplateManager.prototype.getTemplate = function (templateId) {
	try {
		if (typeof(this.pTemplates[templateId]) != "undefined") {
			return this.pTemplates[templateId];
		}
		else {
			console.error("ERROR - TemplateManager.getTemplate() - Unable to retrieve template " + templateId + ". Make sure that template ID has been requested, and that template is used only after template load callback has fired.");
			return null;
		}
	}
	catch(err) {
		console.error("ERROR - TemplateManager.getTemplate() - Unable to retrieve template: " + err.message);
		return "";
	}
};

