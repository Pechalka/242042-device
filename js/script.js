/* -----------------------  Popup -----------------*/
var Popup = function(options) {
  var buttonSelector = options.buttonSelector;
  var modalSelector = options.modalSelector;
  var openedClass = options.openedClass || 'modal--open';
  var closeSelector = options.closeSelector || '.modal__close';

  var link = document.querySelector(buttonSelector);
  var popup = document.querySelector(modalSelector);

  if (!popup || !link) return;

  var closeBtn = popup.querySelector(closeSelector);

  link.addEventListener('click', function(e) {
    e.preventDefault()
    popup.classList.add(openedClass);
  });

  closeBtn.addEventListener('click', function(e) {
    e.preventDefault()
    popup.classList.remove(openedClass);
  });

  window.addEventListener('keydown', function(e) {
    if (e.keyCode === 27) {
      if (popup.classList.contains(openedClass)) {
        popup.classList.remove(openedClass);
      }
    }
  })
}

/* -----------------------  Form -----------------*/
function toJSON(form) {
  var obj = {};
  var elements = form.querySelectorAll( "input, select, textarea" );
  for( var i = 0; i < elements.length; ++i ) {
    var element = elements[i];
    var name = element.name;
    var value = element.value;

    if( name ) {
      obj[ name ] = value;
    }
  }

  return obj;
}

var clearErrorsOnFocus = function(form, errorClass) {
  var elements = form.querySelectorAll( "input, select, textarea" );

  for(var i = 0; i < elements.length; ++i ) {
    (function(i){
      var element = elements[i];
      var name = element.name;
      var value = element.value;

      element.addEventListener('focus', function(e) {
        element.classList.remove(errorClass);
      });

      element.addEventListener('keydown', function(e) {
        element.classList.remove(errorClass);
      });
    })(i);
  }
}

var Form = function(options) {
  var formSelector = options.formSelector;
  var errorClass = options.errorClass || 'input-error';
  var form = document.querySelector(formSelector);

  if (!form) return;

  var fieldsSelectors = Object.keys(options.fields || {});
  var validate = options.validate || function() { return {}; };
  var onSumbit = options.onSumbit || function() {};


  clearErrorsOnFocus(form, errorClass);

  var isValidate = function(data) {
    var errors = validate(data);

    if (Object.keys(errors).length === 0) return true;

    var first = true;
    for(var key in errors) {
      var errorText = errors[key];
      if (errorText) {
        var element = form.querySelector('[name=' + key + ']');

        if (first) {
          element.focus();
          element.classList.add(errorClass);
          first = false;
        }
      }
    }

    return false;
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var form = e.target;
    var formData = toJSON(form);
    if (isValidate(formData)) {
      onSumbit(formData, form);
    }
  })
}

/* -----------------------  Slider -----------------*/

function getCoords(elem) { // кроме IE8-
  var box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}

var drawThumb = function(thumbElem, value) {
  thumbElem.style.left = value + 'px';
}

var dragAndDrop = function(thumbElem, sliderElem, onChange, onMove, maxLeft, maxRight) {
  thumbElem.onmousedown = function(e) {
    var thumbCoords = getCoords(thumbElem);
    var shiftX = e.pageX - thumbCoords.left;
    // shiftY здесь не нужен, слайдер двигается только по горизонтали

    var sliderCoords = getCoords(sliderElem);

    document.onmousemove = function(e) {
      //  вычесть координату родителя, т.к. position: relative
      var newLeft = e.pageX - shiftX - sliderCoords.left;

      // курсор ушёл вне слайдера
      if (newLeft < maxLeft()) {
        newLeft = maxLeft();
      }

      if (maxRight) {
        if (newLeft > maxRight()) {
          newLeft = maxRight()
        }
      }

      var rightEdge = sliderElem.offsetWidth - thumbElem.offsetWidth;
      if (newLeft > rightEdge) {
        newLeft = rightEdge;
      }
      onMove(newLeft);
    }

    document.onmouseup = function() {
      document.onmousemove = document.onmouseup = null;
      onChange(parseInt(thumbElem.style.left));
    };

    return false; // disable selection start (cursor change)
  };

  thumbElem.ondragstart = function() {
    return false;
  };

  thumbElem.onclick = function() {
    return false;
  };
}

var drowLine = function(line, left, right, sliderWidth) {
  line.style.left = left + 'px';
  line.style.right = sliderWidth - right + 'px';
}


//https://learn.javascript.ru/task/slider
var Slider = function(options) {
  var sliderSelecor = options.sliderSelecor;
  var thumbLeftSelector = options.thumbLeftSelector;
  var thumbRightSelector = options.thumbRightSelector;
  var lineSelector = options.lineSelector;

  var sliderElem = document.querySelector(sliderSelecor);
  if (!sliderElem) return;

  var thumbleft = sliderElem.querySelector(thumbLeftSelector);
  var thumbright = sliderElem.querySelector(thumbRightSelector);
  var line = sliderElem.querySelector(lineSelector);
  var onChange = options.onChange || function() {};

  var thumbWidth = thumbleft.getBoundingClientRect().width;
  var sliderWidth = sliderElem.getBoundingClientRect().width;

  var maxPrice = options.maxPrice;

  var price = function(value) {
    return +(value / (sliderWidth - thumbWidth) * maxPrice).toFixed(0);
  }

  var toLeft = function(value) {
    return +(value / maxPrice * (sliderWidth - thumbWidth)).toFixed(0);
  }

  var left = toLeft(options.initMin);
  var right = toLeft(options.initMax);

  drawThumb(thumbleft, left);
  drawThumb(thumbright, right);
  drowLine(line, left, right, sliderWidth);

  onChange(price(left), price(right), left, right);

  dragAndDrop(thumbleft, sliderElem, function(value) {
    left = value;

    onChange(price(left), price(right), left, right);
  }, function(value) {
    drowLine(line, value, right, sliderWidth);
    drawThumb(thumbleft, value);
  }, function(){
    return 0;
  }, function(){
    return parseInt(thumbright.style.left) - thumbWidth;
  });

  dragAndDrop(thumbright, sliderElem, function(value) {
    right = value;

    onChange(price(left), price(right), left, right);
  }, function(value) {
    drowLine(line, left, value, sliderWidth);
    drawThumb(thumbright, value);
  }, function(){
    return parseInt(thumbleft.style.left) + thumbWidth;
  });

}



/* -----------------------  App -----------------*/
window.onload = function(){
  Popup({
    buttonSelector: '.js-map',
    modalSelector: '.js-map-modal',
  });

  Popup({
    buttonSelector: '.js-write-us',
    modalSelector: '.js-write-us-modal',
  });

  Form({
    formSelector: '.js-write-us-modal form',
    validate: function(values){
      if (!values.name) {
        return { name: 'Введите имя' };
      }

      if (!values.email) {
        return { email: 'Введите email' };
      }

      if (!values.message) {
        return { message: 'Введите сообщение' };
      }

      return {};
    },
    onSumbit: function(data){
      console.log(' save form ', data);
    }
  });

  var minPriceSpan = document.querySelector('.range_left__value');
  var maxPriceSpan = document.querySelector('.range_right__value');
  var minPriceInput = document.querySelector('[name=min_price]');
  var maxPriceInput = document.querySelector('[name=max_price]');

  Slider({
    sliderSelecor: '.range',
    thumbLeftSelector: '.range_left',
    thumbRightSelector: '.range_right',
    lineSelector: '.range_field',
    initMin: 0,
    initMax: 5000,
    maxPrice: 10000,
    onChange: function(minPrice, maxPrice, left, right) {
      console.log(minPrice, maxPrice, left, right);

      minPriceSpan.innerHTML = 'от ' + minPrice;
      maxPriceSpan.innerHTML = 'до ' + maxPrice;
      minPriceInput.value = minPrice;
      maxPriceInput.value = maxPrice;
    }
  });
}


