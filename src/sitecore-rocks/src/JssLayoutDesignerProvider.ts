import * as vscode from "vscode";
import { LayoutDesigner } from "./LayoutDesigner";

export class JssLayoutDesignerProvider extends LayoutDesigner implements vscode.TextDocumentContentProvider {
    private onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();

    constructor(public absolutePath: string) {
        super();
    }

    public provideTextDocumentContent(uri: vscode.Uri): vscode.ProviderResult<string> {
        let model = {
            context: {
                pageEditing: false,
                site: {
                    name: "website",
                },
            },
            name: "Test",
            displayName: "Test",
            fields: {
                Title: {
                    value: "test item title",
                    editable: "test item title",
                },
                Text: {
                    value: "test item text",
                    editable: "test item text",
                },
            },
            placeholders: [
                {
                    name: "main",
                    path: "main",
                    elements: [
                        {
                            renderingName: "Header",
                            renderingParams: { Text: "Welcome to Sitecore", Title: "Sitecore" },
                            uid: "fa0f776f-15bf-4c1b-8fb1-0f6eda37c83c",
                        },
                        {
                            renderingName: "Body",
                            renderingParams: { Text: "Welcome to Sitecore", Title: "Sitecore" },
                            uid: "fa0f776f-15bf-4c1b-8fb1-0f6eda37c83b",
                            placeholders: [
                                {
                                    name: "body",
                                    path: "/main/body",
                                    elements: [
                                        {
                                            renderingName: "Image Component",
                                            renderingParams: {},
                                            uid: "60776439-144d-4c9e-ac68-5653502dad47",
                                            placeholders: [],
                                            name: "code",
                                            type: "data/json",
                                            contents: {
                                                Image: {
                                                    value: {
                                                        src: "/-/media/Experience-Explorer/Presets/Julie-128x128.ashx?h=128&amp;la=en&amp;w=128&amp;hash=2F9EA2943DAC7347510D2FB683222981C28DFE8F",
                                                        alt: "Julie",
                                                        width: "128",
                                                        height: "128",
                                                    },
                                                    editable: "",
                                                },
                                            },
                                            attributes: {
                                                type: "data/json",
                                            },
                                        },
                                    ],
                                },
                            ],
                            name: "code",
                            type: "data/json",
                            contents: null,
                            attributes: {
                                type: "data/json",
                            },
                        },
                    ],
                },
            ],
        };

        const uriString = uri.toString();
        if (uriString.substr(0, 28) === "sitecore-jss-layout://file:/") {
            const rocks = (global as any).sitecoreRocks;
            const key = decodeURIComponent(uriString.substr(28));

            model = rocks[key];
            delete rocks[key];
        } else {
            // todo: get model from webservice
        }

        return new Promise((completed, error) => {
            completed(this.render(model, uriString));
        });
    }

    public get onDidChange(): vscode.Event<vscode.Uri> {
        return this.onDidChangeEmitter.event;
    }
}