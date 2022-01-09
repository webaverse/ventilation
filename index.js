import * as THREE from 'three';
import metaversefile from 'metaversefile';

const {useApp, useFrame, useLoaders, usePhysics, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\/]*$/, '$1'); 


export default () => {  

    const app = useApp();
    const physics = usePhysics();
    const physicsIds = [];

    let fanPart = null;

    const loadModel = ( params ) => {

        return new Promise( ( resolve, reject ) => {
                
            //const loader = new GLTFLoader();
            const { gltfLoader } = useLoaders();
            const { dracoLoader } = useLoaders();

            //gltfLoader.setDRACOLoader( dracoLoader );
    
            gltfLoader.load( params.filePath + params.fileName, function( gltf ) {
    
                let numVerts = 0;
    
                gltf.scene.traverse( function ( child ) {

                    if(child.isMesh) {

                        const physicsId = physics.addGeometry( child );
                        physicsIds.push( physicsId );

                    }

                    
                });
    
                //console.log( `Silk Fountain Trees modelLoaded() -> ${ params.fileName } num verts: ` + numVerts );
               

                resolve( gltf.scene );     
            });
        })
    }

    let p1 = loadModel( { 
        filePath: baseUrl,
        fileName: 'aircon.glb',
        pos: { x: 0, y: 0, z: 0 },
    } );

    Promise.all( 
        [ p1]
    ).then( 
        ( values ) => {
            values.forEach( model => {
                app.add( model ) 

                app.traverse(function (child) {
                    if(child.name === 'fan') {
                        fanPart = child;
                    }

                app.updateMatrixWorld();

                

                });

            })

        }
    )

    useFrame(( { timestamp } ) => {

        if(fanPart) {
            fanPart.rotateY(0.01);
            fanPart.updateMatrixWorld();
        }        

    
    });

    useCleanup(() => {
      for (const physicsId of physicsIds) {
       physics.removeGeometry(physicsId);
      }
    });

    return app;
}