const showRequiredAsterisk = (event) => {
  event.context.config.hideRequiredAsterisk = false;
};

const hideRequiredAsterisk = (event) => {
  event.context.config.hideRequiredAsterisk = true;
};

// note that at the moment showData is not use by the template - instead the template shows how to use the script instead
const showData = (event) => {
  const root = event.$el.getRootNode();
  const el = root.querySelector('#data');
  if (el) el.style.display = 'block';
};

const hideData = (event) => {
  const root = event.$el.getRootNode();
  const el = root.querySelector('#data');
  if (el) el.style.display = 'none';
};

const saveData = async (event) => {
  // use sleep function to simulate the REST call
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const data = event.context.data;
  if (event.context.errors && event.context.errors.length > 0) {
    const uidata = event.context.uidata;
    uidata.errorDialog.title = event.context.translate('Error', 'Error');
    uidata.errorDialog.text = event.context.translate(
      'You have errors. Fix those before saving data.',
      'You have errors. Fix those before saving data.',
    );
    uidata.errorDialog.show = true;
  } else {
    try {
      event.context.readonly = true;
      await sleep(4000);

      alert('Data Saved:' + JSON.stringify(data));
      event.context.data = {};
    } finally {
      event.context.readonly = false;
    }
  }
};

const changeLang = (event) => {
  let form = event.$el.getRootNode().host;
  form.setAttribute('locale', event.params.lang);
};

const toggleDarkMode = (event) => {
  event.context.vuetify.dark = !event.context.vuetify.dark;
};

const onChange = (customEvent) => {
  let [event] = customEvent.detail;
  console.log(
    'Form state data:',
    event.data !== undefined ? JSON.stringify(event.data) : '',
  );
  console.log(
    'Form state errors:',
    event.errors !== undefined ? JSON.stringify(event.errors) : '',
  );
};

const onHandleAction = (customEvent) => {
  let [event] = customEvent.detail;
  if (event.action === 'showRequiredAsterisk') {
    event.callback = showRequiredAsterisk;
  } else if (event.action === 'hideRequiredAsterisk') {
    event.callback = hideRequiredAsterisk;
  } else if (event.action === 'showData') {
    event.callback = showData;
  } else if (event.action === 'hideData') {
    event.callback = hideData;
  } else if (event.action === 'saveData') {
    event.callback = saveData;
  } else if (event.action === 'changeLang') {
    event.callback = changeLang;
  } else if (event.action === 'toggleDarkMode') {
    event.callback = toggleDarkMode;
  }
};

export default { onChange, onHandleAction };
