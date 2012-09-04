function stristr (haystack, needle, bool) {
    // Finds first occurrence of a string within another, case insensitive
    //
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/stristr
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfxied by: Onno Marsman
    // *     example 1: stristr('Kevin van Zonneveld', 'Van');
    // *     returns 1: 'van Zonneveld'
    // *     example 2: stristr('Kevin van Zonneveld', 'VAN', true);
    // *     returns 2: 'Kevin '
    var pos = 0;
 
    haystack += '';
    pos = haystack.toLowerCase().indexOf((needle + '').toLowerCase());
    if (pos === -1) {
        return false;
    } else {
        if (bool) {
            return haystack.substr(0, pos);
        } else {
            return haystack.slice(pos);
        }
    }
}

function EtapestryAPI() { }

EtapestryAPI.prototype = {

    soapClient: '',
    _retryLimit: '',
    _loginId: '', //TODO find secure way of storing login details
    _password: '',
    _endpoint: 'https://sna.etapestry.com/v2messaging/service?WSDL',
    _error: '',
    _showErrors: false,

	//_initialize: function ( endpoint ) {

		//this._endpoint = ( endpoint ) ? endpoint : this._endpoint;
		
		//this.createNuSOAPClient();
		//this.login();
	//},
    
    //method and parameters are required, parameters is an array
    invoke: function ( method, paramaters, async, callback ){

        async = (typeof async === 'undefined' ) ? true : async;
        callback = (typeof async === 'undefined' ) ? '' : callback;

       for 
        
        SOAPClient.invoke( this._endpoint, method, parameters, async, callback ); 
    },

	invoke: function ( operation, params ) {

        params = (typeof params === 'undefined' ) ? [] : params;

		var response = this.soapClient.call( operation, params);
		
		if (this.hasFaultOrError(this.soapClient, false) && stristr(this.error, 'wsdl error')) {

			// Retry a call if it has failed to reach api service
			response = this._retryCall( operation, params );
			if (response === false) {
                //TODO Do something with the error
				return false;
			}
		}
		else if (this.hasFaultOrError(this.soapClient)) {
			return false;
		}
		
		return response;
	},
	
	createNuSOAPClient: function ( retry ) {

        retry = (typeof retry === 'undefined' ) ? 0 : retry;

		// Instantiate nusoap_client
		this.soapClient = new nusoap_client(this.endpoint, true);

		// Did an error occur?
		if( this.hasFaultOrError(this.soapClient) ) {
			return false;
		}
		
		return true;
	},
	
    login: function ( loginId, password ) {

		this._loginId = (loginId) ? loginId : this._loginId;
		this._password = (password) ? password : this._password;
		
		// Invoke login method
		var response = this.invoke('login', [ this._loginId, this._password ] );

		// Determine if the login method returned a value...this will occur
		// when the database you are trying to access is located at a different
		// environment that can only be accessed using the provided endpoint
		if ( response !== '' )
		{
			this._endPoint = response;
			this.createNuSOAPClient();

			// Invoke login method
			response = this.invoke('login', [ this._loginId, this._password ] );
		}
		
		return response;
	},
	
    logout: function () {
		// Invoke logout method
		var response = this.invoke('logout');
		
		return response;
	},

    hasFaultOrError: function ( soapClient ) {

		//this.error = NULL;
		try {
			if (soapClient.fault || soapClient.getError()) {

                var message = '',
                    code = '';

                if (!soapClient.fault) {
                    message = soapClient.getError();
                }
                else {
                    code = soapClient.faultcode;
                    message = soapClient.faultstring;
                }
				
			}
		}
		catch (e) {
			var error = e.getMessage();
			e.log_error(e.getMessage());
			if ( this._showErrors ) {
                // print the error
                print(error);
			}
			
			return true;
		}
		
		return false;
	},
	
	_retryCall: function ( operation, params ) {

        params = (typeof params === 'undefined' ) ? [] : params;

		var response = false;
		
		for ( var i=0; i<this._retryLimit; i++) {
			//sleep(5);
			this.createNuSOAPClient();
			response = this.soapClient.call( operation, params);
			if ( ! this.hasFaultOrError(this.soapClient, false) ) {
				break;
			}
		}
		
		return response;
	}

};
