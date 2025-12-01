import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { testService, subjectService } from '@/services/api';
import type { Subject, CreateTestData, CreateQuestionData, QuestionType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';

export default function CreateTestPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [testId, setTestId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<CreateTestData>({
    title: '',
    description: '',
    subject_id: 0,
    total_marks: 0,
    passing_marks: 0,
    duration_minutes: 60,
    available_from: '',
    available_until: '',
    is_published: false,
  });

  const [aiTopic, setAiTopic] = useState('');
  const [aiQuestions, setAiQuestions] = useState({
    mcq: 5,
    trueFalse: 3,
    shortAnswer: 2,
  });

  const [manualQuestion, setManualQuestion] = useState<CreateQuestionData>({
    question_type: 'MCQ',
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    marks: 2,
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const params: any = {};
      // For teachers, only fetch subjects they are assigned to
      if (user?.role === 'TEACHER' && user?.id) {
        params.user_id = user.id;
        params.role = user.role;
      }
      // For students, only fetch subjects they are enrolled in
      if (user?.role === 'STUDENT' && user?.id) {
        params.user_id = user.id;
        params.role = user.role;
      }
      const response = await subjectService.getAll(params);
      setSubjects(response.data.data);
    } catch (error) {
      console.error('Error fetching subjects:', error); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject_id) {
      alert('Please select a subject');
      return;
    }

    try {
      setLoading(true);
      const response = await testService.create(formData);
      setTestId(response.data.id);
      alert('Test created successfully! Now add questions.');
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!testId) {
      alert('Please create the test first');
      return;
    }

    if (!aiTopic.trim()) {
      alert('Please enter a topic for AI generation');
      return;
    }

    try {
      setLoading(true);
      await testService.generateQuestions(testId, {
        topic: aiTopic,
        numMCQ: aiQuestions.mcq,
        numTrueFalse: aiQuestions.trueFalse,
        numShortAnswer: aiQuestions.shortAnswer,
      });
      alert('Questions generated successfully!');
      navigate(`/tests/${testId}`);
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualQuestion = async () => {
    if (!testId) {
      alert('Please create the test first');
      return;
    }

    if (!manualQuestion.question_text.trim()) {
      alert('Please enter a question');
      return;
    }

    try {
      setLoading(true);
      await testService.addQuestion(testId, manualQuestion);
      alert('Question added successfully!');
      
      // Reset form
      setManualQuestion({
        question_type: 'MCQ',
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        marks: 2,
      });
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/tests')} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tests
      </Button>

      <h1 className="text-3xl font-bold mb-6">Create New Test</h1>

      {/* Step 1: Test Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Test Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Test Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={!!testId}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                disabled={!!testId}
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject *</Label>
              <select
                id="subject"
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: parseInt(e.target.value) })}
                className="w-full p-2 border rounded-md"
                required
                disabled={!!testId}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_marks">Total Marks *</Label>
                <Input
                  id="total_marks"
                  type="number"
                  value={formData.total_marks || ''}
                  onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) || 0 })}
                  required
                  disabled={!!testId}
                />
              </div>
              <div>
                <Label htmlFor="passing_marks">Passing Marks *</Label>
                <Input
                  id="passing_marks"
                  type="number"
                  value={formData.passing_marks || ''}
                  onChange={(e) => setFormData({ ...formData, passing_marks: parseInt(e.target.value) || 0 })}
                  required
                  disabled={!!testId}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes || ''}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                required
                disabled={!!testId}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="available_from">Available From *</Label>
                <Input
                  id="available_from"
                  type="datetime-local"
                  value={formData.available_from}
                  onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                  required
                  disabled={!!testId}
                />
              </div>
              <div>
                <Label htmlFor="available_until">Available Until *</Label>
                <Input
                  id="available_until"
                  type="datetime-local"
                  value={formData.available_until}
                  onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                  required
                  disabled={!!testId}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_published"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="mr-2"
                disabled={!!testId}
              />
              <Label htmlFor="is_published">Publish test immediately</Label>
            </div>

            {!testId && (
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Test'}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {testId && (
        <>
          {/* Step 2: Generate Questions with AI */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Step 2: Generate Questions with AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ai_topic">Topic for Question Generation *</Label>
                <Input
                  id="ai_topic"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g., Photosynthesis, Algebra, World War II"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="num_mcq">MCQ Questions</Label>
                  <Input
                    id="num_mcq"
                    type="number"
                    min="0"
                    value={aiQuestions.mcq}
                    onChange={(e) => setAiQuestions({ ...aiQuestions, mcq: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="num_tf">True/False Questions</Label>
                  <Input
                    id="num_tf"
                    type="number"
                    min="0"
                    value={aiQuestions.trueFalse}
                    onChange={(e) => setAiQuestions({ ...aiQuestions, trueFalse: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="num_sa">Short Answer Questions</Label>
                  <Input
                    id="num_sa"
                    type="number"
                    min="0"
                    value={aiQuestions.shortAnswer}
                    onChange={(e) => setAiQuestions({ ...aiQuestions, shortAnswer: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <Button onClick={handleGenerateQuestions} disabled={loading}>
                <Sparkles className="w-4 h-4 mr-2" />
                {loading ? 'Generating...' : 'Generate Questions'}
              </Button>
            </CardContent>
          </Card>

          {/* Step 3: Add Manual Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Add Manual Questions (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question_type">Question Type</Label>
                <select
                  id="question_type"
                  value={manualQuestion.question_type}
                  onChange={(e) => setManualQuestion({ ...manualQuestion, question_type: e.target.value as QuestionType })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="MCQ">Multiple Choice</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="SHORT_ANSWER">Short Answer</option>
                </select>
              </div>

              <div>
                <Label htmlFor="question_text">Question *</Label>
                <Textarea
                  id="question_text"
                  value={manualQuestion.question_text}
                  onChange={(e) => setManualQuestion({ ...manualQuestion, question_text: e.target.value })}
                  rows={3}
                />
              </div>

              {manualQuestion.question_type === 'MCQ' && (
                <div>
                  <Label>Options</Label>
                  {manualQuestion.options?.map((option, index) => (
                    <Input
                      key={index}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(manualQuestion.options || [])];
                        newOptions[index] = e.target.value;
                        setManualQuestion({ ...manualQuestion, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="mb-2"
                    />
                  ))}
                </div>
              )}

              <div>
                <Label htmlFor="correct_answer">Correct Answer *</Label>
                <Input
                  id="correct_answer"
                  value={manualQuestion.correct_answer}
                  onChange={(e) => setManualQuestion({ ...manualQuestion, correct_answer: e.target.value })}
                  placeholder={manualQuestion.question_type === 'TRUE_FALSE' ? 'True or False' : ''}
                />
              </div>

              <div>
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  value={manualQuestion.marks}
                  onChange={(e) => setManualQuestion({ ...manualQuestion, marks: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddManualQuestion} disabled={loading}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
                <Button variant="outline" onClick={() => navigate(`/tests/${testId}`)}>
                  Finish & View Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
