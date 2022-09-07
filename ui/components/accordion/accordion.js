var slice = Array.prototype.slice;

function accordion(selector, options) {
  var $lists = document.querySelectorAll(selector);
  var lists = slice.apply($lists);
  lists.forEach(function (list, index) {
  	new Accordion(list, options);
  });
}

function Accordion($list, options) {
  if (!$list) return;

  var $toggles = $list.querySelectorAll('.accordion-item-toggle');

  var toggles = slice.apply($toggles);

  toggles.forEach(function(item, index) {
  	item.addEventListener('click', function (e) {
  		toggles.forEach(function (item) {
  			item.parentNode.classList.remove('accordion-item-open');
  		});
  		this.parentNode.classList.add('accordion-item-open');
  	});
  });
}


accordion('.accordion-list')