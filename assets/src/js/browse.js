$(document).on('page:browse', function() {
  var foreground = '#foreground';

  /* DELETE FILE */

  var remove = new Object();
  remove.selector = 'form#delete';
  remove.form = $(remove.selector);
  remove.row = '';
  remove.button = '';
  remove.url = '';

  $('#content').on('click', '.delete', function(event) {
    event.preventDefault();
    remove.button = $(this);
    remove.row = $(this).parent().parent();
    $(foreground).fadeIn(200);
    remove.url = remove.row.find('.filename').text();
    remove.form.find('span').text(remove.url);
    remove.form.fadeIn(200);
    return false;
  });

  $('#content').on('submit', remove.selector, function(event) {
    event.preventDefault();

    $.ajax({
      type: 'DELETE',
      url: remove.button.data("file")
    }).done(function(data) {
      $(foreground).fadeOut(200);
      remove.form.fadeOut(200);
      remove.row.fadeOut(200);
      notification({
        text: remove.button.data("message"),
        type: 'success',
        timeout: 5000
      });
    }).fail(function(data) {
      notification({
        text: 'Something went wrong.',
        type: 'error'
      });
      console.log(data);
    });

    return false;
  });

  /* FILE UPLOAD */

  $('#content').on('change', 'input[type="file"]', function(event) {
    event.preventDefault();
    files = event.target.files;

    // Create a formdata object and add the files
    var data = new FormData();
    $.each(files, function(key, value) {
      data.append(key, value);
    });

    $.ajax({
      url: window.location.pathname,
      type: 'POST',
      data: data,
      cache: false,
      dataType: 'json',
      headers: {
        'X-Upload': 'true',
      },
      processData: false,
      contentType: false,
    }).done(function(data) {
      notification({
        text: "File(s) uploaded successfully.",
        type: 'success',
        timeout: 5000
      });

      $.pjax({
        url: window.location.pathname,
        container: '#content'
      })
    }).fail(function(data) {
      notification({
        text: 'Something went wrong.',
        type: 'error'
      });
      console.log(data);
    });
    return false;
  });

  $('#content').on('click', '#upload', function(event) {
    event.preventDefault();
    $('.actions input[type="file"]').click();
    return false;
  });

  /* NEW FILE */

  var create = new Object();
  create.selector = 'form#new';
  create.form = $(create.selector);
  create.input = create.selector + ' input[type="text"]';
  create.button = '';
  create.url = '';

  $('#content').on('click', '.new', function(event) {
    event.preventDefault();
    create.button = $(this);
    $(foreground).fadeIn(200);
    create.form.fadeIn(200);
    return false;
  });

  $('#content').on('keypress', create.input, function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      $(create.form).submit();
      return false;
    }
  });

  $('#content').on('submit', create.selector, function(event) {
    event.preventDefault();

    var value = create.form.find('input[type="text"]').val(),
      splited = value.split(":"),
      filename = "",
      archetype = "";

    if (value == "") {
      notification({
        text: "You have to write something. If you want to close the box, click the button again.",
        type: 'warning',
        timeout: 5000
      });

      return false;
    } else if (splited.length == 1) {
      filename = value;
    } else if (splited.length == 2) {
      filename = splited[0];
      archetype = splited[1];
    } else {
      notification({
        text: "Hmm... I don't understand you. Try writing something like 'name[:archetype]'.",
        type: 'error'
      });

      return false;
    }

    var content = '{"filename": "' + filename + '", "archetype": "' + archetype + '"}';

    $.ajax({
      type: 'POST',
      url: window.location.pathname,
      data: content,
      dataType: 'json',
      encode: true,
    }).done(function(data) {
      notification({
        text: "File created successfully.",
        type: 'success',
        timeout: 5000
      });

      $.pjax({
        url: data.Location,
        container: '#content'
      })
    }).fail(function(data) {
      notification({
        text: 'Something went wrong.',
        type: 'error'
      });
      console.log(data);
    });

    return false;
  });

  /* RENAME FILE */

  var rename = new Object();
  rename.selector = 'form#rename';
  rename.form = $(rename.selector);
  rename.input = rename.selector + ' input[type="text"]';
  rename.button = '';
  rename.url = '';

  $('#content').on('click', '.rename', function(event) {
    event.preventDefault();
    rename.button = $(this);

    $(foreground).fadeIn(200);
    rename.url = $(this).parent().parent().find('.filename').text();
    rename.form.fadeIn(200);
    rename.form.find('span').text(rename.url);
    rename.form.find('input[type="text"]').val(rename.url);

    return false;
  });

  $('#content').on('keypress', rename.input, function(event) {
    if (event.keyCode == 13) {
      event.preventDefault();
      $(rename.form).submit();
      return false;
    }
  });

  $('#content').on('submit', rename.selector, function(event) {
    event.preventDefault();

    var filename = rename.form.find('input[type="text"]').val();
    if (filename === "") {
      return false;
    }

    if (filename.substring(0, 1) != "/") {
      filename = window.location.pathname.replace("/admin/browse/", "") + '/' + filename;
    }

    var content = '{"filename": "' + filename + '"}';

    $.ajax({
      type: 'PUT',
      url: rename.url,
      data: content,
      dataType: 'json',
      encode: true
    }).done(function(data) {
      $.pjax({
        url: window.location.pathname,
        container: '#content'
      });
      notification({
        text: rename.button.data("message"),
        type: 'success',
        timeout: 5000
      });
    }).fail(function(data) {
      notification({
        text: 'Something went wrong.',
        type: 'error'
      });
      console.log(data);
    });

    return false;
  });

  /* $(foreground) AND STUFF */

  $('#content').on('click', '.close', function(event) {
    event.preventDefault();
    $(this).parent().parent().fadeOut(200);
    $(foreground).click();
    return false;
  });

  $('#content').on('click', foreground, function(event) {
    event.preventDefault();
    $(foreground).fadeOut(200);
    create.form.fadeOut(200);
    rename.form.fadeOut(200);
    remove.form.fadeOut(200);
    return false;
  });
});
