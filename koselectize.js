(function (factory) {
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    factory(require('knockout'), exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['knockout', 'exports'], factory);
  } else {
    factory(ko);
  }
}(function (ko) {

  'use strict';

  if (typeof ko === 'undefined') {
    throw 'Knockout is required, please ensure it is loaded before loading this plug-in';
  }

  ko.selectize = {}; // Hoist  to global scope (requires manual clean-up)

  function getOptions(overrides) {
    var options = ko.utils.extend({}, ko.bindingHandlers.selectize.defaultOptions);

    return ko.utils.extend(options, overrides);
  }

  ko.bindingHandlers.selectize = {
    init: function(element, valueAccessor, allBindingsAccessor, deprecated, bindingContext) {
      var
        value = valueAccessor(),
        optionsUnwrapped = ko.utils.unwrapObservable(value),
        globalIdentifier = null;        

      if (allBindingsAccessor.has('options') && (allBindingsAccessor.has('value') || allBindingsAccessor.has('selectedOptions'))) {
        ko.bindingHandlers.options.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
      } else {
        throw('KoSelectize - could not initialize options binding as no option binding is present');
      }

      // Handle options set from array of objects
      optionsUnwrapped.valueField = allBindingsAccessor.get('optionsValue');
      optionsUnwrapped.labelField = allBindingsAccessor.get('optionsText');
      optionsUnwrapped.searchField = allBindingsAccessor.get('optionsText');

      // Initiate selectize on the object         
      globalIdentifier = $(element).attr('id') || optionsUnwrapped.globalIdentifier;
      ko.selectize[globalIdentifier] = $(element).selectize(getOptions(optionsUnwrapped))[0].selectize;

      var $select = ko.selectize[globalIdentifier];

      if (typeof allBindingsAccessor.get('options') == 'function') {
        var newOptions = ko.utils.unwrapObservable(allBindingsAccessor.get('options'));
        $select.addOption(newOptions);
        $select.refreshOptions();
        $binding.subscribe(function (new_val) {
          $select.addOption(new_val);
          $select.refreshOptions();                
        })
      }  

        if (typeof allBindingsAccessor.get('value') == 'function') {
            $select.addItem(allBindingsAccessor.get('value')());
            allBindingsAccessor.get('value').subscribe(function (new_val) {
                $select.addItem(new_val);
            })
        }
 
        if (typeof allBindingsAccessor.get('selectedOptions') == 'function') {
            allBindingsAccessor.get('selectedOptions').subscribe(function (new_val) {
                // Removing items which are not in new value
                var values = $select.getValue();
                var items_to_remove = [];
                for (var k in values) {
                    if (new_val.indexOf(values[k]) == -1) {
                        items_to_remove.push(values[k]);
                    }
                }
 
                for (var k in items_to_remove) {
                    $select.removeItem(items_to_remove[k]);
                }
 
                for (var k in new_val) {
                    $select.addItem(new_val[k]);
                }
 
            });
            var selected = allBindingsAccessor.get('selectedOptions')();
            for (var k in selected) {
                $select.addItem(selected[k]);
            }
        };

      // Register Events (If needed - note selectize updates based on options bindings)
      // ko.utils.registerEventHandler(element, '', function (e) {});

      ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
        ko.selectize[globalIdentifier].destroy();
        delete ko.selectize[globalIdentifier];   // Manual Clean-up
      });
    }
  
  ko.bindingHandlers.activity.defaultOptions = {};
}));