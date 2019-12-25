import { STOPS } from "../common/globals.js"

console.log("Opening Pitt Transit Settings page");

let autoValues = [];
for (let key in STOPS) {
  autoValues.push( {
    "name": key,
    "id": STOPS[key]["stpid"]
  } );
}

function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Pitt Schedule</Text>}>
        <AdditiveList
          title="Select your favorite stations"
          settingsKey="favorite_stop_setting"
          maxItems="3"
          addAction={
            <TextInput
              title="Add a Bus Stop"
              label="Stop Name"
              placeholder="Type something"
              action="Add Bus Stop"
              onAutocomplete={(value) => {
                return autoValues.filter((option) =>
                  option.name.toLowerCase().startsWith(value.toLowerCase()));
              }}
            />
          }
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
