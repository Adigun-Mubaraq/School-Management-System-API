const http              = require('http');
const express           = require('express');
const cors              = require('cors');
const helmet            = require('helmet');
const swaggerUi         = require('swagger-ui-express');
const swaggerDocument   = require('../../swagger.json');
const app               = express();

module.exports = class UserServer {
    constructor({config, managers}){
        this.config        = config;
        this.userApi       = managers.userApi;
        this.responseDispatcher = managers.responseDispatcher;
    }
    
    /** for injecting middlewares */
    use(args){
        app.use(args);
    }

    /** server configs */
    run(){
        app.use(helmet());
        app.use(cors({origin: '*'}));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true}));
        app.use('/static', express.static('public'));

        /** Swagger Documentation */
        app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

        /** an error handler */
        app.use((err, req, res, next) => {
            console.error(err.stack);
            this.responseDispatcher.dispatch(res, {
                ok: false,
                code: 500,
                errors: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
            });
        });
        
        /** a single middleware to handle all */
        app.all('/api/:moduleName/:fnName', this.userApi.mw);

        let server = http.createServer(app);
        server.listen(this.config.dotEnv.USER_PORT, () => {
            console.log(`${(this.config.dotEnv.SERVICE_NAME).toUpperCase()} is running on port: ${this.config.dotEnv.USER_PORT}`);
        });
    }
}