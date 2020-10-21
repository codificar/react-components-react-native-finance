# react-native-finance
A component for earnings report and account statement

## Install
add in package.json:
```bash
"PROJECTNAME": "git+https://libs:ofImhksJ@git.codificar.com.br/react-components/react-native-finance.git",
```

## Usage

```javascript

import FinanceComponent from "react-native-finance";

<financeComponent
	route={'localhost:8000/libs/finance/test'}
	providerId={this.state.providerId}
	token={this.state.token}
/>


```

## Properties

| Prop  | Default  | Type | Description |
| :------------ |:---------------:| :---------------:| :-----|
| route | '' | `string` | rota para pegar o relatorio de saques|
| providerId | - | `number` | id do prestador |
| providerId | - | `string` | token do prestador |

