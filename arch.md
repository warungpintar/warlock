                               # Basic arch
                         
                                                                                      
                                                                                      +---------------+
                               # parser config                                    +---|     mesh      |---+     +--------------+
                               req:             +----------------+                |   |   structure   |   |     |  MockTools   |
                                - .warlock.yaml |  Config File   +---[js-yaml]----+   +---------------+   +---->|   AppServe   |
                                                +----------------+                |                       |     |              |
                                                                                  |   +---------------+   |     +--------------+
                                                                                  +---|    warlock    |---+
                               # client application                                   |   structure   |
                               +-----------------+                                    +---------------+
                               |       App       |<----------------------------+
                               +--------+-------++                             |
                                        |                                      |
                                        v                                      |
                               +---------------------+                 +-------+-------+
                               | MockTools AppServe  |                 |     Result    | 
                               +---------------------+                 +---------------+
                                            |                                  ^
                                            v                                  |
                                        +---+------------+                     |
                                        |    Resolver    +---------------------+
                                        +----------------+
                                               #########1 Root Data
                                               # resolve from cache if exist
                                               ### cache only from {origin} for make {stale}, while request new in {origin}
                                               # resolve from origin if exist
                                               # resolve from mock if not exist in {origin} and {mock} 
                                               # resolve from mock can be function, json, javascript code, or generate from faker
                                               #########2 Faker or Transform 
                                               # apply additional faker or transform fields
                                               # finally, make and return {Result}
                                            
                                
                                                   
                                                   
                                                   
                                                   
                                                   
                                                   
                                                   
                                                   
                                                   
                                                   
