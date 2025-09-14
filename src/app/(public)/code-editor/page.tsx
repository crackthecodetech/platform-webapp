import CodeEditor from '../courses/[courseId]/CodingEditor';

const CodeEditorPage = () => {
    return (
        <div>
            <CodeEditor
                testCases={[]}
                code_title="Code Editor"
                custom_input={true}
            />
        </div>
    );
};

export default CodeEditorPage;
