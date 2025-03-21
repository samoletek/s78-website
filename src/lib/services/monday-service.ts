interface FormData {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  interest: string;
}

export async function submitToMonday(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    // Получаем API ключ и ID доски из переменных окружения
    const apiKey = process.env.NEXT_PUBLIC_MONDAY_API_KEY;
    const boardId = process.env.NEXT_PUBLIC_MONDAY_BOARD_ID;
    
    // ID колонок из переменных окружения
    const nameColumnId = process.env.NEXT_PUBLIC_MONDAY_NAME_COLUMN_ID;
    const emailColumnId = process.env.NEXT_PUBLIC_MONDAY_EMAIL_COLUMN_ID;
    const companyColumnId = process.env.NEXT_PUBLIC_MONDAY_COMPANY_COLUMN_ID;
    const phoneColumnId = process.env.NEXT_PUBLIC_MONDAY_PHONE_COLUMN_ID;
    const messageColumnId = process.env.NEXT_PUBLIC_MONDAY_MESSAGE_COLUMN_ID;
    const interestColumnId = process.env.NEXT_PUBLIC_MONDAY_INTEREST_COLUMN_ID;
    
    // Проверяем наличие необходимых переменных окружения
    if (!apiKey || !boardId) {
      console.error('Missing API key or board ID');
      return { 
        success: false, 
        message: 'Server configuration error. Please contact support.' 
      };
    }
    
    // Подготавливаем данные для колонок
    const columnValues: Record<string, unknown> = {};
    
    if (nameColumnId) columnValues[nameColumnId] = formData.name;
    if (emailColumnId) columnValues[emailColumnId] = { email: formData.email, text: formData.email };
    if (companyColumnId) columnValues[companyColumnId] = formData.company;
    if (phoneColumnId) columnValues[phoneColumnId] = { phone: formData.phone, countryShortName: 'US' };
    if (messageColumnId) columnValues[messageColumnId] = formData.message;
    if (interestColumnId) columnValues[interestColumnId] = { label: formData.interest };
    
    // Формируем мутацию GraphQL
    const mutation = `
      mutation CreateItem {
        create_item (
          board_id: ${boardId},
          item_name: "Contact from ${formData.name}",
          column_values: ${JSON.stringify(JSON.stringify(columnValues))}
        ) {
          id
        }
      }
    `;
    
    // Отправляем данные в Monday.com
    const response = await fetch('https://api.monday.com/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey
      },
      body: JSON.stringify({ query: mutation })
    });
    
    const responseData = await response.json();
    
    // Проверяем успешность запроса
    if (responseData.errors) {
      console.error('Monday.com API error:', responseData.errors);
      return {
        success: false,
        message: 'Error submitting form. Please try again later.'
      };
    }
    
    if (responseData.data && responseData.data.create_item && responseData.data.create_item.id) {
      return {
        success: true,
        message: 'Form submitted successfully!'
      };
    } else {
      return {
        success: false,
        message: 'Error submitting form. Please try again later.'
      };
    }
  } catch (error) {
    console.error('Error submitting to Monday.com:', error);
    return {
      success: false,
      message: 'Error submitting form. Please try again later.'
    };
  }
}