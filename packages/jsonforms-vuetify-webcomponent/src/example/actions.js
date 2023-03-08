const showRequiredAsterisk = (event) => {
  event.jsonforms.config.hideRequiredAsterisk = false;
};

const hideRequiredAsterisk = (event) => {
  event.jsonforms.config.hideRequiredAsterisk = true;
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

  const data = event.jsonforms.core.data;
  if (event.jsonforms.core.errors && event.jsonforms.core.errors.length > 0) {
    const uidata = event.context.uidata;
    uidata.errorDialog.title = event.jsonforms.i18n.translate('Error', 'Error');
    uidata.errorDialog.text = event.jsonforms.i18n.translate(
      'You have errors. Fix those before saving data.',
      'You have errors. Fix those before saving data.'
    );
    uidata.errorDialog.show = true;
  } else {
    try {
      event.jsonforms.readonly = true;
      await sleep(4000);

      alert('Data Saved:' + JSON.stringify(data));
    } finally {
      event.jsonforms.readonly = false;
    }
  }
};

const changeLang = (event) => {
  let form = event.$el.getRootNode().host;

  form.setAttribute('locale', event.params.lang);
};

export let actions = {
  hideRequiredAsterisk: hideRequiredAsterisk,
  showRequiredAsterisk: showRequiredAsterisk,
  showData: showData,
  hideData: hideData,
  saveData: saveData,
  changeLang: changeLang,
};

export const onChange = (event) => {
  let [data] = event.detail;
  console.log('Form state changed:' + JSON.stringify(data));
};
