//subjects ---> WILL BE RECEIVED FROM CLIENT SIDE IN THE FUTURE
export const examSubjectTableNames = {
    primary: ["social_studies", "science", "mathematics", "english_language"],
    secondary: [
        "mathematics",
        "english_language",
        "chemistry",
        "biology",
        "physics",
        "history_east_africa",
        "history_west_africa",
        "history_south_africa",
        "history_central_africa",
        "economics",
        "computer_studies"
    ],
}

export const AttributeType = {
    STRING: 'string',
    EMAIL: 'email',
    ENUM: 'enum',
    INTEGER: 'integer',
    BOOLEAN: 'boolean',
    FLOAT: 'float',
    URL: 'url',
    IP: 'ip',
    DATETIME: 'datetime',
};

//Single Tables
export const tableInitialization = async (classes, streams) => {
    const initialTables = [
        {
            tableName: 'student',
            attributes: [
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'userID',
                        size: 36,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'firstName',
                        size: 25,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'lastName',
                        size: 25,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },

                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'otherName',
                        size: 25,
                        required: false,
                        defaultValue: null,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.ENUM,
                    data: {
                        key: 'gender',
                        elements: ['male', 'female'],
                        required: true,
                        arr: false
                    }
                },
                {
                    attrType: AttributeType.ENUM,
                    data: {
                        key: 'studClass',
                        elements: classes,
                        required: true,
                        arr: false
                    }
                },
                {
                    attrType: AttributeType.ENUM,
                    data: {
                        key: 'stream',
                        elements: streams,
                        required: true,
                        arr: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'label',
                        size: 30,
                        required: false,
                        defaultValue: null,
                        arr: true,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.DATETIME,
                    data: {
                        key: 'accountCreationDate',
                        required: false,
                        defaultValue: null,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.EMAIL,
                    data: {
                        key: 'email',
                        elements: classes,
                        required: false,
                        defaultValue: null,
                        arr: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'userType',
                        size: 20,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
            ]
        },
        {
            tableName: 'admin',
            attributes: [
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'userID',
                        size: 36,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'firstName',
                        size: 25,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'lastName',
                        size: 25,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'otherName',
                        size: 25,
                        required: false,
                        defaultValue: null,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.ENUM,
                    data: {
                        key: 'gender',
                        elements: ['male', 'female'],
                        required: true,
                        arr: false
                    }
                },
                {
                    attrType: AttributeType.EMAIL,
                    data: {
                        key: 'email',
                        elements: classes,
                        required: false,
                        defaultValue: null,
                        arr: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'phone',
                        size: 25,
                        required: false,
                        defaultValue: null,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'label',
                        size: 30,
                        required: false,
                        defaultValue: null,
                        arr: true,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.DATETIME,
                    data: {
                        key: 'accountCreationDate',
                        required: false,
                        defaultValue: null,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'userType',
                        size: 20,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
            ]
        },
        {
            tableName: 'student_results',
            attributes: [
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'studID',
                        size: 36,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'subjectName',
                        size: 25,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'results',
                        size: 100000,
                        required: true,
                        arr: true,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'examID',
                        size: 36,
                        required: false,
                        defaultValue: null,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.DATETIME,
                    data: {
                        key: 'dateTime',
                        required: false,
                        default: null,
                        optional: false,
                    }
                },
                {
                    attrType: AttributeType.FLOAT,
                    data: {
                        key: 'marks',
                        required: true,
                        min: 0,
                        max: null,
                    }
                },
                {
                    attrType: AttributeType.FLOAT,
                    data: {
                        key: 'finalPossibleMarks',
                        required: true,
                        min: 1,
                        max: null,
                    }
                }
            ]
        },
        {
            tableName: `Set_Exams`,
            attributes: [
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'examID',
                        size: 36,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'subjectName',
                        size: 25,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'examQuestions',
                        size: 100000,
                        required: true,
                        arr: true,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'userID',
                        size: 36,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'classID',
                        size: 36,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'stream',
                        size: 36,
                        required: true,
                        arr: true,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.DATETIME,
                    data: {
                        key: 'openingDate',
                        required: false,
                        default: null,
                        optional: false,
                    }
                },
                {
                    attrType: AttributeType.DATETIME,
                    data: {
                        key: 'closingDate',
                        required: false,
                        default: null,
                        optional: false,
                    }
                },
                {
                    attrType: AttributeType.INTEGER,
                    data: {
                        key: 'durationMINS',
                        required: true,
                        min: 0,
                        max: null,
                    }
                },
            ]
        },
        {
            tableName: 'classes',
            attributes: [
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'classID',
                        size: 36,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'streams',
                        size: 30,
                        required: false,
                        defaultValue: null,
                        arr: true,
                        encrypt: false
                    }
                }
            ]
        },
        {
            tableName: 'school',
            attributes: [
                // {
                //     attrType: AttributeType.STRING,
                //     data: {
                //         key: 'schoolID',
                //         size: 36,
                //         required: true,
                //         arr: false,
                //         encrypt: false
                //     }
                // },
                {
                    attrType: AttributeType.ENUM,
                    data: {
                        key: 'educationLevel',
                        elements: ['primary', 'secondary'],
                        required: true,
                        arr: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'schoolName',
                        size: 200,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'address',
                        size: 100,
                        required: true,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.EMAIL,
                    data: {
                        key: 'email',
                        elements: classes,
                        required: true,
                        defaultValue: null,
                        arr: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'phone',
                        size: 25,
                        required: true,
                        defaultValue: null,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.DATETIME,
                    data: {
                        key: 'accountCreationDate',
                        required: false,
                        defaultValue: null,
                        arr: false,
                        encrypt: false
                    }
                },
            ]
        },
        {
            tableName: 'subjects',
            attributes: [
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'subjectName',
                        size: 50,
                        required: false,
                        defaultValue: null,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.STRING,
                    data: {
                        key: 'examTableId',
                        size: 36,
                        required: false,
                        defaultValue: null,
                        arr: false,
                        encrypt: false
                    }
                },
                {
                    attrType: AttributeType.BOOLEAN,
                    data: {
                        key: 'available',
                        required: false,
                        defaultValue: false,
                        arr: false
                    }
                },
            ]
        }
    ];

    return initialTables;
}

//Multiple exam-subject tables with same structure
export const examSubjectTablesInitialization = async (subjectNames) => {
    const initialTables = subjectNames.map(subjectName => ({
        tableName: subjectName,
        attributes: [
            {
                attrType: AttributeType.INTEGER,
                data: {
                    key: 'category',
                    required: true,
                    min: 0,
                    max: 100,
                    defaultValue: null,
                    arr: false
                }
            },
            {
                attrType: AttributeType.STRING,
                data: {
                    key: 'instructions',
                    size: 200,
                    required: false,
                    defaultValue: null,
                    arr: false,
                    encrypt: false
                }
            },
            {
                attrType: AttributeType.STRING,
                data: {
                    key: 'questions',
                    size: 1000000,
                    required: false,
                    defaultValue: null,
                    arr: false,
                    encrypt: false
                }
            },
        ]
    }));

    return initialTables;
}

//Multiple studClass tables with same structure
export const classTablesInitialization = async (classes) => {
    const initialTables = classes.map(class_ => ({
        tableName: `${class_}_Class`,
        attributes: [
            {
                attrType: AttributeType.STRING,
                data: {
                    key: 'studClass',
                    size: 10,
                    required: true,
                    defaultValue: null,
                    arr: false,
                    encrypt: false
                }
            },
            {
                attrType: AttributeType.STRING,
                data: {
                    key: 'streams',
                    size: 200,
                    required: false,
                    defaultValue: null,
                    arr: true,
                    encrypt: false
                }
            },
        ]
    }));

    return initialTables;
}