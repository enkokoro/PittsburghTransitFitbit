import { BUSROUTES, STOPS } from "../common/globals.js"

console.log("Opening Pitt Transit Settings page");


let autoValues = [];
for (let key in STOPS) {
  autoValues.push( {
    "name": key,
    "id": STOPS[key]["stpid"]
  } );
}

let autoValues_r = [];
BUSROUTES.forEach(b => {autoValues_r.push({"name": b});});

function mySettings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Favorite Bus Stops</Text>}>
        <AdditiveList
          title="Select your favorite stops"
          settingsKey="favorite_stop_setting"
          maxItems="10"
          addAction={
            <TextInput
              title="Add a Bus Stop"
              label="Add Stop"
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
      
      <Section
        title={<Text bold align="center">Favorite Bus Routes</Text>}>
        <AdditiveList
          title="Select your favorite routes"
          settingsKey="favorite_route_setting"
          maxItems="10"
          addAction={
            <TextInput
              title="Add a Bus Route"
              label="Add Route"
              placeholder="Type something"
              action="Add Bus Route"
              onAutocomplete={(value) => {
                return autoValues_r.filter((option) =>
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
